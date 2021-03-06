#To use with thin
# thin start -p PORT -R config.ru

require 'sinatra'

# include our Application code
require File.join(File.dirname(__FILE__), 'app.rb')
#require File.join(File.dirname(__FILE__), 'api_application.rb')

# disable sinatra's auto-application starting
disable :run

# we're in dev mode
set :environment, :development

# Mount our Main class with a base url of /
map "/" do
  run PokerApp
end
