# ip=192.168.42.1
# 
ip=192.168.42.2

#clear data.db
echo 'clear data..'
ssh root@$ip 'rm /mnt/data/var/lib/wirenboard/db/data.db'
echo 'clear data done!'

#copy upgrade data
echo 'copy upgrade data..'
./upgrade_by_ssh.sh
echo 'copy upgrade data done'