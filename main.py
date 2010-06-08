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
import hashlib
import re
import os
import datetime

# Google App Engine imports
from google.appengine.api import memcache
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

# Custom imports
from model.datastorage import ds_data

class js(webapp.RequestHandler):
    def get(self, path):
    	
    	# sign.. legacy code.. Supporting ?f= and ?files= from 
    	# version 1 and 2 of the service.
    	request = self.request.get('f').lower() if self.request.get('f') else self.request.get('files') if self.request.get('files') else path
    	
    	# We need the correct content type for each request
    	self.response.headers['content-type'] = 'text/javascript'
    	
        # Cancel processing if we don't have a valid request
        if not request:
		self.error(404)
		return
		
	# handle 304 requests
	# at a later stage we will allow the length to be specified in the url and parse it
	# modifiedsince = datetime.datetime.strptime(self.request.headers.get('If-Modified-Since'), "%a, %d %b %Y %H: %M:%S GMT")
	# for now everyrequest with a if-modified-since header will recieve a 304 as it passed our generation process
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
        	memcache.add( token, cache, 3600 )
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
        
        # Added a license header to the file
        if os.path.isfile(license):
        	concatenate.extend( open(license,'r').readlines() )
        
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
        
        result = "".join( concatenate )
        storage = ds_data(md5=token,uncompiled=result)
        storage.compiled = "test"
        
        # set our development flag if the user want to development builds instead of compressed builds
        if "dev" in query:
        	storage.dev = True
        
        self.response.out.write( result )
        #storage.put()

        
        
class css(webapp.RequestHandler):
    def get(self, request):
        self.response.out.write('Hello world!')

class beacon(webapp.RequestHandler):
    def get(self):
        self.response.out.write('Hello world!')

class MainHandler(webapp.RequestHandler):
    def get(self):
        self.response.out.write('Hello world!')

def main():
    interface = webapp.WSGIApplication(
    	[
    		(r'/js(?:(.*))$', js),
    		(r'/css(?:(.*))$', css),
    		('/', MainHandler)
    	], debug=True)
    util.run_wsgi_app(interface)


if __name__ == '__main__':
    main()
