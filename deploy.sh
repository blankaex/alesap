rm -rf build
git clone git@github.com:blankaex/alesap.git build
cd build
git checkout gh-pages
cd ..
mv build/.git gitbak
rm -rf build
mkdir -p build/weaver
sleep 2
bundle exec weaver build --root=alesap.blankaex.reisen
rm -rf build/js/MathJax
mv gitbak build/.git
cd build
echo alesap.blankaex.reisen > CNAME
git add .
git commit -m "update"
git push
cd ..
