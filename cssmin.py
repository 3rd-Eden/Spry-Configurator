__author__ = "Arnout Kazemier (info@3rd-Eden.com)"
__version__ = "1"
__license__ = "BSD (revised) open source license"

import re

class compressor():
	def cssmin( self, css, linebreakpos ):
	
		startIndex = 0
		endIndex = 0
		preservedToken = []
		comments = []
		totallen = len( css )
		placeholder = ''
		
		# collect all comment blocks...
		while css.find( '/*' , startIndex ) >= 0:
			## FIXME: find a way to prevent duplicate startIndex so we can store it
			startIndex = css.find( '/*' , startIndex )
			endIndex = css.find( '*/', startIndex + 2 )
			
			if endIndex < 0:
				endIndex = totallen
			
			token = css[startIndex + 2 : endIndex ]
			comments.append( token )
			css = css[0:startIndex + 2] + "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" + str( len( comments ) - 1 ) + "___" + css[endIndex:]
			startIndex += 2;
		
		# preserve strings so their content doesn't get accidentally minified
		chunk = re.compile("(\"([^\\\\\"]|\\\\.|\\\\)*\")|(\'([^\\\\\']|\\\\.|\\\\)*\')")
		chunks = chunk.search( css )
		
		return chunks.groups()
		return css