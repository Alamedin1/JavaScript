ip=192.168.42.1
# ip=192.168.42.2

#clear database global
echo 'clear database global..'
ssh root@$ip 'rm /mnt/data/var/lib/wirenboard/wbrules-persistent.db'
echo 'clear database global done!'

#clear database local (dev)
echo 'clear database local..'
ssh root@$ip 'rm /mnt/data/var/lib/wirenboard/wbrules-vdev.db'
echo 'clear database local done!'

#copy database global
echo 'copy database global..'
scp ../db/wbrules-persistent.db root@$ip:/mnt/data/var/lib/wirenboard
echo 'copy database global done'

#copy database local (dev)
echo 'copy database local..'
scp ../db/wbrules-vdev.db root@$ip:/mnt/data/var/lib/wirenboard
echo 'copy database local done'