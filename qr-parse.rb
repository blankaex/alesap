#!/bin/ruby

require 'json'
require 'net/http'
require 'uri'

# ARGV[0] = qr code
# ARGV[1] = user input

# parse qr code "url"
format = Regexp.new("http://rdn_[A-Za-z0-9]+\.[A-Za-z0-9]+,[A-Za-z0-9]+,[0-9]+/")
abort "Invalid URL" if !format.match? ARGV[0]
akey, skey, scd = ARGV[0].split('/')[2].split(',')

# parse input type
case ARGV[1].strip
when "stop" then
  type = 2
when "flat" then
  type = 3
when "sharp" then
  type = 4
else
  ecd = ARGV[1].strip
end

# set http request parameters
uri = URI("http://order.mashup.jp/bridge/post_request.php")
body = { akey: akey, skey: skey, scd: scd }
body["type"] = type if type
body["ecd"] = ecd if ecd

# send http request
response = Net::HTTP.post(uri, URI.encode_www_form(body))
puts JSON.parse(response.body)
