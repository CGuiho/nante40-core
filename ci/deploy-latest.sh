#!/bin/bash


_app_name="guiho-core"

_file_dir=$(dirname $0)
_ci_dir=$(realpath $_file_dir)

echo -e "\n🚀 Deploying latest version of $_app_name \n"

_version=$($_ci_dir/get-latest-version.sh $_app_name)

echo -e "\n🚀 Latest version is: $_version \n"

$_ci_dir/prod-deploy.sh $_version
