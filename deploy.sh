rm -rf build
git clone $FRONTEND_URL build
cd build
git checkout gh-pages
cd ..
mv build/.git gitbak
rm -rf build
mkdir -p build/weaver
sleep 2
bundle exec weaver build --root=$FRONTEND_ROOT
rm -rf build/js/MathJax
mv gitbak build/.git
cd build
echo $FRONTEND_ROOT > CNAME
git add .
git commit -m "update"
git push
cd ..
