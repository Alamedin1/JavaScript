ip=192.168.42.1
# ip=192.168.42.2

#copy database global to git
echo 'copy database global to git..'
scp root@$ip:/mnt/data/var/lib/wirenboard/wbrules-persistent.db ../db
echo 'copy database global to git done'

#copy database local (dev) to git
echo 'copy database local to git..'
scp root@$ip:/mnt/data/var/lib/wirenboard/wbrules-vdev.db ../db
echo 'copy database local to git done'