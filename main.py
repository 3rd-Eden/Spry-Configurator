#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util

class js(webapp.RequestHandler):
    def get(self, request):
        self.response.out.write('Hello world!')
        
        # We are trying to be as tolerant as possible
        # Remove double slashes to prevent pointless array
        # creating when we are converting the request
        while request[-1] == "/":
        	request = request[:len(request)-1]
        
        # Users do not need to prefix the files with Spry and
        # we lowercase everything as the filenames are lowercase
        # as well. Better one big .lower() than many .lower()
        query = request.lower().replace('spry','').split('/')
        	
        self.response.out.write( query )

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
    		(r'/js/(.*)/$', js),
    		(r'/css/(.*)/$', css),
    		('/', MainHandler)
    	], debug=True)
    util.run_wsgi_app(interface)


if __name__ == '__main__':
    main()
