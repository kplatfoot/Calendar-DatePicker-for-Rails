require 'fileutils'

FileUtils.cp File.dirname(__FILE__) + '/public/javascripts/datepicker.js', "#{RAILS_ROOT}/public/javascripts/"
