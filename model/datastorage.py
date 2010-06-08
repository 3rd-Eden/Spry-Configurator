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

from google.appengine.ext import db

class ds_data( db.Model ):
	'''
		Storage for the compiled data, so we don't have to send the same requests over and over again to
		the Google Closure services when our memory cache gets invalid. This way we can check if we have 
		a compiled version that we serve directly to the users.
	'''
	# the compressed source code
	compiled = db.TextProperty( )
	
	# the combined source code
	uncompiled = db.TextProperty( required=True )
	
	# used as tmp name for the file so we can compress it at once using the code_url param
	md5 = db.StringProperty( required=True )
	
	# this should be set if it's a development build
	dev = db.BooleanProperty()