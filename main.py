#!/usr/bin/python2.4
#
# Copyright Arnout Kazemier
#
# Licensed under the Apache License, Version 2.0 (the 'License')
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http:#www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @Author: Arnout Kazemier, <info@3rd-eden.com>

# "native" python imports
import httplib, urllib, datetime, os, re, hashlib

# Google App Engine imports
from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

# Custom module imports
from model.datastorage import ds_data

class js(webapp.RequestHandler):
	def get(self, path):

		# Sign.. legacy code.. Supporting ?f= and ?files= from 
		# version 1 and 2 of the configuration service.
		request = self.request.get('f').lower() if self.request.get('f') else self.request.get('files') if self.request.get('files') else path
		
		# Global timeout for memcached
		memcached_timeout = 3600

		# All action require a correct content-type, so we set it in advance.
		self.response.headers['content-type'] = 'text/javascript'

		# If we don't have a propper request, we are just going to quit and
		# give a 404 error. No need to use pointless CPU cycles.
		if not request:
			self.error(404)
			return

		# Handle 304 requests when a If-Modified header is present in the request. At a later
		# stage we will allow the duration to be specified in the url and parse it using 
		# modifiedsince = datetime.datetime.strptime(self.request.headers.get('If-Modified-Since'), "%a, %d %b %Y %H: %M:%S GMT")
		if self.request.headers.get('If-Modified-Since'):
			self.error(304)
			return

		# We are trying to be as tolerant as possible
		# Remove double slashes to prevent pointless array
		# creating when we are converting the request
		while request[-1] == "/":
			request = request[:len(request)-1]

		# Users do not need to prefix the files with Spry and
		# we lowercase everything as the filenames are lowercase
		# as well. Better one big .lower() than many .lower()
		query = request.lower().replace('spry','').split('/')

		# check for memcache hits so we can serve a correct request
		# and have a clean token to use. Keys have a 250 char limit, so we hash
		token = hashlib.md5( ''.join(query) + "js" ).hexdigest()
		cache = memcache.get(token)

		# caching headers
		expires = datetime.datetime.now() + datetime.timedelta(days=365)
		self.response.headers['Last-Modified'] = datetime.datetime.now().strftime("%a, %d %b %Y %H:%M:%S GMT")
		self.response.headers["Cache-Control"] = "public, max-age=31536000"
		self.response.headers["Expires"] = expires.strftime("%a, %d %b %Y %H:%M:%S GMT") 

		# Memory cache hit! \o/ return the content, we already set expire headers
		if cache:
			self.response.out.write(cache)
			return

		# Check if we have a compiled version in our dataset
		storage = ds_data.all().filter('md5 = ', token ).get()

		if storage:
			cache = storage.compiled if storage.compiled else storage.uncompiled
			memcache.add( token, cache, memcached_timeout )
			self.response.out.write( cache )
			return

		# This is where the nitty gritty starts, we failed all caching options so we now have to generate
		# the actual contents for the request.
		concatenate = []
		supported_versions = []
		license = 'license/js.txt'
		re_version = re.compile('^([0-9]{1,2}\.[0-9]{1}(\.[0-9]){0,4})$')

		# Loop over the directorys in js to see which versions we currently support
		# This gives us a list we can check again later on, aswell present us with the default version
		for root, dirs, files in os.walk('js'):
			supported_versions.extend( dirs )

		default_version = supported_versions[-1]
		version = default_version

		for type in query:
			# Check if we are dealing with a filename or a version tag
			# if we have a version check if we support that version, if not default to
			# default version. And continue with the next item in the loop.
			if re_version.match( type ):
				version = type if type in supported_versions else default_version
				continue

			# We are dealing with filename at this point, so we can savely construct a file location
			# based on information we have gathered so far.
			file_location = 'js/' + version + '/' + ( 'spry' if type != "xpath" else "" ) + type + ".js"
			
			# See if it exists, and add it to our concatenate list
			if os.path.isfile( file_location ):
				concatenate.extend( open( file_location,'r' ).readlines() )

		# compile the concatenate results to one "big" string
		cache = "".join( concatenate )
		
		storage = ds_data(md5=token,uncompiled=cache)

		# Set the development flag if the user want to use develpment builds instead of compressed build
		# If this is not the case, use the Google Closure Service API to compile the code to a optimized piece
		# of code. By using the Google Closure Service API we have access to the latest tips and tricks in compression
		if "dev" in query:
			storage.dev = True
		else:
			# Generate the parameters for the request
			params = urllib.urlencode([
				('code_url','http://config.spry-it.com/beacon?frag=' + token ),
				('compilation_level', 'SIMPLE_OPTIMIZATIONS'),
				('output_format','text'),
				('output_info', 'compiled_code')
			])
			
			# Do the request to the google closure service
			headers = { "Content-type": "application/x-www-form-urlencoded" }
			conn = httplib.HTTPConnection('closure-compiler.appspot.com')
			conn.request('POST', '/compile', params, headers)
			
			results = []
			
			# As the Google Closure destroys the default license headers we are going to add them back to the
			# compiled source code.
			if os.path.isfile(license):
				results.extend( open(license,'r').readlines() )
			
			# Add the response to the results list
			results.extend( conn.getresponse().read() )
			
			# Add it to our data storage
			storage.compiled = "".join( results )

		# Store all results in our dataset and update our memcached layer
		storage.put()
		memcache.add( token, storage.compiled if not storage.dev else cache, memcached_timeout )
		self.response.out.write(storage.compiled if not storage.dev else cache)

class css(webapp.RequestHandler):
	def get(self, request):
		self.response.out.write('Hello css!')

class beacon(webapp.RequestHandler):
	def get(self):
		# Get the request token so we can get the correct result from the data set
		token = self.request.get( 'frag' )
		
		# Set the correct content-type to ensure correct rendering
		self.response.headers['content-type'] = 'text/javascript'
		
		# Cancel processing if we don't have a valid request
		if not token or not re.match(r"([a-fA-F\d]{32})", token):
			self.error(404)
			return
		
		# Process the token
		storage = ds_data.all().filter( 'md5 = ', token ).get()
		if storage:
			self.response.out.write(storage.uncompiled)
		else:
			self.error(404)
			self.response.out.write("/* no results available */")

class MainHandler(webapp.RequestHandler):
	def get(self):
		self.response.out.write('Hello main!')

def main():
	interface = webapp.WSGIApplication(
		[
			(r'/js(?:(.*))$', js),
			(r'/css(?:(.*))$', css),
			('/beacon', beacon),
			('/', MainHandler)
		], debug=True)
	util.run_wsgi_app(interface)

if __name__ == '__main__':
	main()
