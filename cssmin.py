# YUI Compressor
# Author: Julien Lecomte - http://www.julienlecomte.net/
# Copyright (c) 2009 Yahoo! Inc. All rights reserved.
# The copyrights embodied in the content of this file are licensed
# by Yahoo! Inc. under the BSD (revised) open source license.

# This is a Python port of the YUI Compressor CSS minification tool
# It's compatible with at least Python 2.5, making it Google Appengine compatible
__author__ = "Arnout Kazemier (www.3rd-Eden.com)"
__version__ = "1"
__license__ = "BSD (revised) open source license"

import re

class compressor():
	def cssmin( self, css, linebreakpos ):

		startIndex = 0
		endIndex = 0
		preservedTokens = []
		comments = []
		totallen = len( css )
		placeholder = ''

		# Pre-compile regexp as they are used inside loops and functions
		re_alpha_filter = re.compile( r"progid:DXImageTransform\.Microsoft\.Alpha\(Opacity=", re.I )
		re_preserve = re.compile( r"(\"([^\\\"]|\\.|\\)*\")|('([^\\']|\\.|\\)*')" )

		# Collect all comment blocks...
		while css.find( '/*' , startIndex ) >= 0:
			startIndex = css.find( '/*' , startIndex )
			endIndex = css.find( '*/', startIndex + 2 )

			if endIndex < 0:
				endIndex = totallen

			token = css[ startIndex + 2 : endIndex ]
			comments.append( token )
			css = css[ 0:startIndex + 2 ] + "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" + str( len( comments ) - 1 ) + "___" + css[ endIndex: ]
			startIndex += 2;

		# The actual function that replaces the content with 
		def preserve_strings( match ):
			match = match.group(0)
			quote = match[0]

			match = match[ 1:-1 ]

			# Maybe the string contains a comment-like substring?
        	# One, maybe more? Put'em back then
			if match.find( "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" ) >= 0:
				for i in range( 0, len(comments) ):
					match = match.replace( "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" + str( i ) + "___", comments[i] )

			match = re_alpha_filter.sub( "alpha(opacity=", match )
			preservedTokens.append( match )
			return quote + "___YUICSSMIN_PRESERVED_TOKEN_" + str( len( preservedTokens ) - 1 ) + "___" + quote

		# Preserve strings so their content doesn't get accidentally minified
		css = re_preserve.sub( preserve_strings, css )

		# Strings are safe, now wrestle the comments
		for i in range( 0, len(comments) ):
			token = comments[i]
			placeholder = "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" + str( i ) + "___"

			# ! In the first position of the comment means preserve
			# so push to the preserved tokens keeping the !
			if token and token[0] == "!":
				preservedTokens.append( token )
				css = css.replace( placeholder, "___YUICSSMIN_PRESERVED_TOKEN_" + str( len( preservedTokens ) - 1 ) + "___" )
				continue

			# \ in the last position looks like hack for Mac/IE5
			# shorten that to /*\*/ and the next one to /* */
			if token and token[ len(token)-1 ] == "\\":
				preservedTokens.append( "\\" )
				css = css.replace( placeholder, "___YUICSSMIN_PRESERVED_TOKEN_" + str( len( preservedTokens ) - 1 ) + "___" )

				i = i + 1 # Attn: advancing the loop

				preservedTokens.append( '' )
				css = css.replace( "___YUICSSMIN_PRESERVE_CANDIDATE_COMMENT_" + str( i ) + "___",  "___YUICSSMIN_PRESERVED_TOKEN_" + str( len( preservedTokens ) - 1 ) + "___" )
				continue;

			# Keep empty comments after child selectors (IE7 hack)
			# e.g. html >/**/ body
			if len( token ) == 0:
				startIndex = css.find( placeholder )
				if startIndex > 2:
					if css[ startIndex - 3 ] == '>':
						preservedTokens.append( '' )
						css = css.replace( placeholder, "___YUICSSMIN_PRESERVED_TOKEN_" + str( len( preservedTokens ) - 1 ) + "___" )

			# In all other cases kill the comment
			css = css.replace( '/*' + placeholder + '*/', '' )

		# Normalize all whitespace strings to single spaces. Easier to work with that way.
		css = re.sub( r"\s+", " ", css )

		# Remove the spaces before the things that should not have spaces before them.
		# But, be careful not to turn "p :link {...}" into "p:link{...}"
		# Swap out any pseudo-class colons with the token, and then swap back.
		def pseudocolons( match ):
			match = match.group(0)
			return match.replace( ":", "___YUICSSMIN_PSEUDOCLASSCOLON___" )

		css = re.sub( r"(^|\})(([^\{:])+:)+([^\{]*\{)", pseudocolons, css )
		css = re.sub( r"\s+([!{};:>+\(\)\],])", r"\1", css )
		css = css.replace( "___YUICSSMIN_PSEUDOCLASSCOLON___", ":" )

		# Retain space for special IE6 cases
		css = re.sub( r":first-(line|letter)(\{|,)", r":first-\1 \2", css )

		# No space after the end of a preserved comment
		css = re.sub( r"\*\/ ", '*/', css )

		# If there is a @charset, then only allow one, and push to the top of the file.
		css = re.compile( r'^(.*)(@charset "[^"]*";)', re.I ).sub( r"\2\1", css )
		css = re.compile( r'^(\s*@charset [^;]+;\s*)+', re.I ).sub( r"\1", css )

		# Put the space back in some cases, to support stuff like
		# @media screen and (-webkit-min-device-pixel-ratio:0){
		css = re.compile( r'\band\(', re.I ).sub( 'and (', css )

		# Remove the spaces after the things that should not have spaces after them.
		css = re.sub( r'([!{}:;>+\(\[,])\s+', r"\1", css )

		# Remove unnecessary semicolons
		css = re.sub( r';+\}', '}', css )

		# Replace 0(px,em,%) with 0.
		css = re.compile( r'([\s:])(0)(px|em|%|in|cm|mm|pc|pt|ex)', re.I ).sub( r"\1\2", css )

		# Replace 0 0 0 0; with 0.
		css = re.sub(r':0 0 0 0(;|\})', r":0\1", css )
		css = re.sub(r':0 0 0(;|\})', r":0\1", css )
		css = re.sub(r':0 0(;|\})', r":0\1", css )

		# Replace background-position:0; with background-position:0 0;
		css = re.compile( r'background-position:0(;|\})', re.I ).sub( r"background-position:0 0\1", css )

		# Replace 0.6 to .6, but only when preceded by : or a white-space
		css = re.sub( r'(:|\s)0+\.(\d+)', r"\1.\2", css )

		# Shorten colors from rgb(51,102,153) to #336699
		# This makes it more likely that it'll get further compressed in the next step.
		def rgbtocolor( match ):
			rgbcolors = match.group(1).split( ',' )
			for i in range( 0, len( rgbcolors ) ):
				rgbcolors[i] = hex( int( rgbcolors[i] ) )[ 2: ]
				if len( rgbcolors[i] ) == 1:
					rgbcolors[i] = "0" + str( rgbcolors[i] )

			return '#' + ''.join( rgbcolors )

		css = re.compile( r'rgb\s*\(\s*([0-9,\s]+)\s*\)', re.I ).sub( rgbtocolor, css )

		# Shorten colors from #AABBCC to #ABC. Note that we want to make sure
		# the color is not preceded by either ", " or =. Indeed, the property
		#    filter: chroma(color="#FFFFFF");
		# would become
		#    filter: chroma(color="#FFF");
		# which makes the filter break in IE.

		def shortencolors( match ):
			
			if	match.group(3).lower() == match.group(4).lower() and match.group(5).lower() == match.group(6).lower() and match.group(7).lower() == match.group(8).lower():
				return str(match.group(1) + match.group(2) + "#" + match.group(3) + match.group(5) + match.group(7) ).lower()
			else:
				return match.group(0).lower()

		css = re.compile( r'([^"\'=\s])(\s*)#([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])([0-9a-f])', re.I ).sub( shortencolors, css )

		# Shorter opacity IE filter
		css = re.compile( r'progid:DXImageTransform\.Microsoft\.Alpha\(Opacity=', re.I ).sub( "alpha(opacity=", css )

		# Remove empty rules
		css = re.sub( r'[^\};\{\/]+\{\}', '', css )

		if linebreakpos >= 0:
			# Some source control tools don't like it when files containing lines longer
			# than, say 8000 characters, are checked in. The linebreak option is used in
			# that case to split long lines after a specific column.
			startIndex = 0
			i = 0
			while i < len( css ):
				i = i + 1
				if css[ i - 1 ] == '}' and i - startIndex > linebreakpos:
					css = css[ :i ] + '\n' + css[ i: ]
					startIndex = i

		# Replace multiple semi-colons in a row by a single one
		# See SF bug #1980989
		css = re.sub( r';;+', ';', css )

		# restore preserved comments and strings
		for i in range( 0, len( preservedTokens ) ):
			css = css.replace( "___YUICSSMIN_PRESERVED_TOKEN_" + str( i ) + "___", preservedTokens[i] )

		# Trim the final string (for any leading or trailing white spaces)
		css = re.sub( r'^\s+|\s+$', '', css );

		return css