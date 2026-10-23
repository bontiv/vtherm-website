# Bosch Heizkörper-Thermostat II [+M]

Mit Zigbee2MQTT stellt dieser TRV eine beschreibbare Entität `pi_heating_demand` bereit. _VTherm_ kann sie für die [Selbstregulierung bei direkter Ventilkontrolle](/de/docs/self-regulation/#selbstregulierung-bei-direkter-ventilkontrolle) verwenden. Im Matter-Modus ist `pi_heating_demand` nur lesbar: Verwenden Sie den Zigbee-Modus.

## Einschränkungen

1. Etwa 15 Minuten nach dem letzten Befehl kehrt der TRV zu seinem eigenen internen Algorithmus zurück. Eine Automatisierung, die den letzten Wert von `pi_heating_demand` regelmäßig erneut sendet, hält das Ventil unter der Kontrolle von _VTherm_.
2. Beim Ausschalten setzt der TRV einen Sollwert von 5 °C.
3. Wasser fließt erst ab etwa 15 % Öffnung: Passen Sie die minimale Öffnung an Ihren Heizkörper an.

> [!NOTE]
> Wegen dieser Einschränkungen ist dieses Gerät nur teilweise kompatibel.
