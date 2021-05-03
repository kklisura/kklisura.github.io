require 'digest'
require 'fileutils'

module Jekyll
  module FingerprintUtils
    def self.config(dest)
      begin
        assets_config_content = File.read(config_file_path(dest))
        JSON.parse(assets_config_content)
      rescue
        {}
      end
    end

    def self.write_config(dest, config)
      begin
        File.open(config_file_path(dest), 'w') do |file|
          file.write(JSON.pretty_generate(config))
        end
      rescue
        {}
      end
    end

    private

    def self.config_file_path(dest)
      File.join(dest, "assets.json")
    end
  end
end

Jekyll::Hooks.register :pages, :post_write do |page|
  require 'fileutils'
  require 'json'
  require 'pathname'

  if Jekyll.env == "production"
    # NOTE(kklisura): Hardcoded for now...
    if page.name == "style.scss"
      # Copy produced document/page to a new file with changed filename which now
      # contains sha256 hash
      input_file_abs_path = page.destination(page.site.dest)

      input_file_fingerprint = Digest::SHA256.file(input_file_abs_path)
      input_file_fingerprint = input_file_fingerprint.hexdigest

      output_file_abs_path = File.join(
        File.dirname(input_file_abs_path),
        File.basename(input_file_abs_path, ".*") + "-" + input_file_fingerprint + File.extname(input_file_abs_path)
      )

      FileUtils.cp(input_file_abs_path, output_file_abs_path)

      assets_input_path = File.join("/", Pathname.new(input_file_abs_path).relative_path_from(Pathname.new(page.site.dest)).to_s)
      assets_output_path = File.join("/", Pathname.new(output_file_abs_path).relative_path_from(Pathname.new(page.site.dest)).to_s)

      # Create a mapping of previous asset path to a new asset path which now contains
      # fingerprint hash

      config = Jekyll::FingerprintUtils.config(page.site.dest)
      config[assets_input_path] = assets_output_path
      Jekyll::FingerprintUtils.write_config(page.site.dest, config)
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  if Jekyll.env == "production"
    config = Jekyll::FingerprintUtils.config(site.dest)

    site.pages.each do |item|
      config.each do |key, value|
        item.output.gsub! key, value
        item.write(site.dest)
      end
    end
  end
end