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
# weaver only copies flat files from js/ and css/ so we do a full recursive copy for subdirs
cp -r js/libs build/js/libs
cp -r css/libs build/css/libs
# copy the i18n strings file to the build root
cp source/strings.json build/strings.json
mv gitbak build/.git
cd build
echo $FRONTEND_ROOT > CNAME
git add .
git commit -m "update"
git push
cd ..
