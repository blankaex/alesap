rm -rf build
git clone git@github.com:davidsiaw/alesap build
cd build
git checkout gh-pages
cd ..
mv build/.git gitbak
rm -rf build
mkdir -p build/weaver
sleep 2
docker run --rm -v $PWD/pages:/app/pages -v $PWD/images:/app/images -v $PWD/build:/app/build davidsiaw/alesap sh bin/build.sh
rm -rf build/js/MathJax
mv gitbak build/.git
cd build
echo alesap.astrobunny.net > CNAME
git add .
git commit -m "update"
git push
cd ..
