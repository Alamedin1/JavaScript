# ip=192.168.42.1
# 
ip=192.168.42.2

ssh root@$ip 'rm /mnt/data/etc/wb-mqtt-serial.conf.d/templates/*'

#copy templates
echo 'reload epr60 template..'
scp ../drivers/epr60/config-epr60* root@$ip:/mnt/data/etc/wb-mqtt-serial.conf.d/templates/
echo 'reload epr60 template done!'

echo 'reload sensor (wb-mio) template..'
scp ../drivers/sensor/config-man_sensor* root@$ip:/mnt/data/etc/wb-mqtt-serial.conf.d/templates/
scp ../drivers/sensor/config-unpacker_sensor* root@$ip:/mnt/data/etc/wb-mqtt-serial.conf.d/templates/
echo 'reload sensor (wb-mio) template done!'

echo 'reload actuator (wb-mio) template..'
scp ../drivers/actuator/config-man_actuator* root@$ip:/mnt/data/etc/wb-mqtt-serial.conf.d/templates/
scp ../drivers/actuator/config-unpacker_actuator* root@$ip:/mnt/data/etc/wb-mqtt-serial.conf.d/templates/
echo 'reload actuator (wb-mio) template done!'

#reload ports
echo 'reload ports..'
ssh root@$ip 'rm /mnt/data/etc/wb-mqtt-serial.conf'
scp ../ports/wb-mqtt-serial.conf root@$ip:/mnt/data/etc/wb-mqtt-serial.conf
echo 'reload ports done!'

#clear rules
echo 'clear rules..'
ssh root@$ip 'rm /mnt/data/etc/wb-rules/*'
echo 'clear rules done!'

#copy drivers
echo 'copy epr60 driver..'
scp ../drivers/epr60/driver* root@$ip:/etc/wb-rules-modules/
echo 'copy epr60 driver done!'

echo 'copy sensor (wb-mio) driver..'
scp ../drivers/sensor/driver* root@$ip:/etc/wb-rules-modules/
echo 'copy sensor (wb-mio) driver done!'

echo 'copy actuator (wb-mio) driver..'
scp ../drivers/actuator/driver* root@$ip:/etc/wb-rules-modules/
echo 'copy actuator (wb-mio) driver done!'

echo 'copy driver config..'
scp ../driver-config* root@$ip:/etc/wb-rules-modules/
echo 'copy driver config done'

# #copy configs
echo 'copy rules config..'
scp ../config* root@$ip:/mnt/data/etc/wb-rules/
echo 'copy rules config done'

#copy manipulator rules
echo 'copy manipulator models and rules..'
scp ../manipulator/V* root@$ip:/mnt/data/etc/wb-rules/
scp ../manipulator/rules/R* root@$ip:/mnt/data/etc/wb-rules/
scp ../manipulator/ui/V* root@$ip:/mnt/data/etc/wb-rules/
echo 'copy manipulator models and rules done'

#copy unpacker rules
echo 'copy unpacker models and rules..'
scp ../unpacker/V* root@$ip:/mnt/data/etc/wb-rules/
scp ../unpacker/rules/R_U* root@$ip:/mnt/data/etc/wb-rules/
scp ../unpacker/ui/V* root@$ip:/mnt/data/etc/wb-rules/
echo 'copy unpacker models and rules done'

# #copy salad module rules
# echo 'copy salad module models and rules..'
# scp ../salad_module/V* root@$ip:/mnt/data/etc/wb-rules/
# scp ../salad_module/rules/R* root@$ip:/mnt/data/etc/wb-rules/
# scp ../salad_module/ui/V* root@$ip:/mnt/data/etc/wb-rules/
# echo 'copy salad module models and rules done'

#copy api
# echo 'copy api..'
# scp ../api/V* root@$ip:/mnt/data/etc/wb-rules/
# echo 'copy  api done'

# copy robot_test
echo 'copy TEST models and rules..'
scp ../TEST/R_* root@$ip:/mnt/data/etc/wb-rules/
scp ../TEST/V_* root@$ip:/mnt/data/etc/wb-rules/
echo 'copy TEST models and rules done'

#clear dashboards
echo 'clear dashboards..'
ssh root@$ip 'rm /mnt/data/etc/wb-webui.conf'
echo 'clear dashboards done!'

#copy dashboards
echo 'copy dashboards..'
scp ../dashboard/wb-webui.conf root@$ip:/mnt/data/etc/wb-webui.conf
echo 'copy dashboards done'

#FULL REBOOT
# ssh root@$ip reboot

# ssh root@$ip 'mqtt-delete-retained '


#restart mqtt serial driver
echo 'restarting serial service..'
ssh root@$ip 'service wb-mqtt-serial restart'
echo 'restarting service done!'
