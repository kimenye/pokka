require 'rubygems'
require 'sinatra'


class PokerApp < Sinatra::Base

  get '/' do
    haml :home, :layout => :index
  end


  configure do
    set :public_folder, Proc.new { File.join(root, "static") }
    enable :sessions
  end
end