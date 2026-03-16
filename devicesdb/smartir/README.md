# SmartIR compatible devices

You can use [SmartIR](https://github.com/smartHomeHub/SmartIR/) to control Air Conditioner (AC) with IR remote.

For Moes UFO-R11, you will need to execute a script to convert IR codes from broadlink to Tuya.

*This integration and device require a good skill in Home Assistant configuration. Many configurations are not available from the graphical interface.*

## Compatible devices

### IR Controllers
These IR controllers are reported as working by SmartIR project:
- Broadlink
- Xiaomi IR Remote (ChuangmiIr)
- LOOK.in Remote
- ESPHome User-defined service for remote transmitter
- MQTT Publish service
  - Tuya Z06/Moes UFO-R11 zigbee2mqtt
- ZHA Zigbee IR remote (May require custom zha quirk for given controller)


### Available Climates
These manufacturers are supported:
- Toyotomi
- Panasonic
- General Electric
- LG
- Hitachi
- Daikin
- Mitsubishi
- Actron
- Carrier
- Gree
- Tosot
- Sungold
- Consul
- Toshiba
- Fujitsu
- Sharp
- Haier
- Tadiran
- Springer
- Midea
- Samsung
- Sintech
- Akai
- Alliance
- Junkers
- Sanyo
- Hisense
- Whirlpool
- Chigo
- Beko
- Tornado
- Electrolux
- Kelvinator
- Electra
- DeLonghi
- Hyundai
- AEG
- Bosch

The complete list of available devices is here:

https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE_CODES.md

Check this list for your model and manufacturer.


## Install SmartIR
You can install SmartIR with HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=litinoveweedle&repository=SmartIR)


## Configure the climate entity
Read [the configuration from SmartIR](https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE.md) for configuration instructions.

You need to add the configuration in your `configuration.yaml`.


### Convert IR Codes from Broadlink to Z06/UFO-R11
Only for users with the UFO-R11 controller.

Using `https://gist.github.com/svyatogor/7839d00303998a9fa37eb48494dd680f?permalink_comment_id=5153002#gistcomment-5153002` you can convert Broadlink code file.

Example: python3 broadlink_to_tuya.py 1287.json > 9997.json
