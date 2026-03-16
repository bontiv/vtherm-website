# Appareils compatibles SmartIR

Vous pouvez utiliser [SmartIR](https://github.com/smartHomeHub/SmartIR/) pour contrôler des climatiseurs (AC) avec une télécommande IR.

Pour le Moes UFO-R11, vous devrez exécuter un script pour convertir les codes IR de Broadlink vers Tuya.

*Cette intégration et cet appareil nécessitent de bonnes compétences en configuration de Home Assistant. De nombreuses configurations ne sont pas disponibles depuis l'interface graphique.*

l'[article de blog suivant](https://julien-moreau.fr/2025/08/12/renvoi-ir-moes-ufo-r11-zs06/) en français décrit toute la procédure pas à pas.

## Appareils compatibles

### Contrôleurs IR
Ces contrôleurs IR sont signalés comme fonctionnels par le projet SmartIR :
- Broadlink
- Xiaomi IR Remote (ChuangmiIr)
- LOOK.in Remote
- ESPHome service défini par l'utilisateur pour émetteur IR
- Service MQTT Publish
  - Tuya Z06/Moes UFO-R11 zigbee2mqtt
- ZHA Zigbee IR Remote (peut nécessiter un quirk ZHA personnalisé pour le contrôleur concerné)


### Climatiseurs disponibles
Les fabricants suivants sont pris en charge :
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

La liste complète des appareils disponibles se trouve ici :

https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE_CODES.md

Vérifiez cette liste pour votre modèle et votre fabricant.


## Installer SmartIR
Vous pouvez installer SmartIR avec HACS :

[![Ouvrez votre instance Home Assistant et ouvrez un dépôt dans le Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=litinoveweedle&repository=SmartIR)


## Configurer l'entité climatiseur
Lisez [la documentation de configuration de SmartIR](https://github.com/litinoveweedle/SmartIR/blob/master/docs/CLIMATE.md) pour les instructions de configuration.

Vous devez ajouter la configuration dans votre fichier `configuration.yaml`.


### Convertir les codes IR de Broadlink vers Z06/UFO-R11
Uniquement pour les utilisateurs disposant du contrôleur UFO-R11.

En utilisant `https://gist.github.com/svyatogor/7839d00303998a9fa37eb48494dd680f?permalink_comment_id=5153002#gistcomment-5153002`, vous pouvez convertir un fichier de codes Broadlink.

Exemple : python3 broadlink_to_tuya.py 1287.json > 9997.json
