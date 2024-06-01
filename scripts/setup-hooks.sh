#!/bin/sh

# Git 훅 디렉토리가 존재하지 않으면 생성
mkdir -p .git/hooks

# pre-commit 훅을 복사
cp src/scripts/hooks/pre-commit .git/hooks/pre-commit

# 운영 체제에 따라 권한 설정
OS="$(uname -s)"
case "${OS}" in
    CYGWIN*|MINGW*|MSYS*)
        echo "Detected Windows environment"
        # Git Bash에서 실행 권한을 설정하는 방법 (Windows)
        chmod +x .git/hooks/pre-commit
        ;;
    *)
        echo "Detected Unix-like environment"
        # Unix-like 시스템 (Linux, MacOS 등)에서 실행 권한 설정
        chmod +x .git/hooks/pre-commit
        ;;
esac
