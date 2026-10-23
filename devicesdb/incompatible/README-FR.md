# Incompatibilités connues

Les appareils suivants sont connus pour ne pas fonctionner avec Versatile Thermostat. Les appareils qui fonctionnent avec des limitations sont listés sur la page des [limitations connues](/fr/devices/known-limitations/).

1. Les vannes **Danfoss POPP** avec retour de température. Il est impossible d'éteindre cette vanne car elle s'auto-régule elle-même, ce qui provoque des conflits avec VTherm.
2. Les thermostats de type **Heatzy** qui ne supportent pas les commandes `set_temperature`. Seuls les modèles sans `set_temperature` sont concernés : le Heatzy pilote est supporté (voir [Heatzy](/fr/devices/heatzy/)).
3. Les climatisations basées sur l'intégration **Overkiz** ne fonctionnent pas. Il semble impossible d'éteindre ces systèmes ou même d'en changer la température.
4. **Tuya Wi-Fi Smart TRV** : quand la température de la pièce est synchronisée par le décalage de calibration, ce décalage dérive sans fin. L'appareil ne peut pas être régulé par _VTherm_.
5. Les thermostats **MOES BHT-002** : la consigne saute vers des valeurs aberrantes. Le modèle BHT-006 n'a pas ce problème.
6. Les thermostats qui n'exposent que le mode `heat_cool` (par exemple certains thermostats Beok ou Tuya). _VTherm_ ne peut pas savoir si l'appareil chauffe ou refroidit.
