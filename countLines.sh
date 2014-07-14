# A Unix shell script that displays the line count
# for each source code file recursively.
#
# The goal is to keep every file under 100 lines of code.
#
# By Curran Kelleher 4/15/2014 

# $excluded is a regex for paths to exclude from line counting
excluded="spec\|node_modules\|bower_components\|README\|lib\|docs\|csv\|XLS\|json\|png\|\.git\|tsv"

countLines(){
  # $total is the total lines of code counted
  total=0
  # -mindepth exclues the current directory (".")
  for file in `find . -mindepth 1 -name "*.*" |grep -v "$excluded"`; do
    # First sed: only count lines of code that are not commented with //
    # Second sed: don't count blank lines
    # $numLines is the lines of code
    numLines=`cat $file | sed '/\/\//d' | sed '/^\s*$/d' | wc -l`
    total=$(($total + $numLines))
    echo "  " $numLines $file
  done
  echo "  " $total in total
}

echo Examples:
cd examples
countLines
cd ../

echo Unit tests:
cd tests
countLines
cd ../

echo Core files:
cd src
countLines
cd ../
