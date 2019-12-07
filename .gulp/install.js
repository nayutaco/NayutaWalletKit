module.exports = function (gulp, plugins) {
    var limitedMode = false;
    gulp.task('ensure:android', function (done) {
        if (process.env.PLATFORM !== "android") {
            plugins.utils.log(plugins.utils.colors.yellow.bold("Android is not the target platform; task skipped..."));
            process.exit();
          }else{
            done();
          }
    });

    gulp.task('ensure:ios', function (done) {
        if (process.env.PLATFORM !== "ios") {
            plugins.utils.log(plugins.utils.colors.yellow.bold("ios is not the target platform; task skipped..."));
            process.exit();
          }else{
            done();
          }
    });

    gulp.task('install:getSDK', gulp.series(gulp.parallel('ensure:android'), function (done) {
        console.log("start install:getSDK");
        if (limitedMode) {
            done();
            return;
        }
        plugins.exec("wget https://dl.google.com/android/repository/sdk-tools-linux-4333796.zip", { maxBuffer: 1024 * 500 }, function (err) {

            if (err) return plugins.utils.abort(err.message, done);
            console.log("unzipping sdk");
            plugins.exec("unzip -q sdk-tools-linux-4333796.zip", done).stdout.pipe(process.stdout);
            console.log("did finsih install sdk");

        }).stdout.pipe(process.stdout);
    }));


    gulp.task('install:moveFolder', gulp.series(gulp.parallel('install:getSDK'), function (done) {
        if (limitedMode) {
            done();
            return;
        }
        console.log("start install:moveFolder");

        plugins.exec("sudo mv tools/ /home/travis/build/", done).stdout.pipe(process.stdout);

    }));

    gulp.task('install:configPath', gulp.series(gulp.parallel('install:moveFolder'), function (done) {
        if (limitedMode) {
            done();
            return;
        }
        console.log("start install:configPath");
        plugins.exec('titanium config android.sdkPath $ANDROID_HOME', function (err) {
            console.error(err);
            if (err) return plugins.utils.abort(err.message, done);
            process.env.ANDROID_VERSION = process.env.ANDROID_VERSION || '28';
            plugins.utils.log(plugins.utils.colors.cyan.bold("Processing install for android " + process.env.ANDROID_VERSION));
            done();
        });

    }));

    gulp.task('install:update_platformTools', gulp.series(gulp.parallel('install:configPath'), function (done) {
        if (limitedMode) {
            done();
            return;
        }

        plugins.exec('echo y | sdkmanager "platforms;android-28" "build-tools;28.0.3" | grep -v = || true', { maxBuffer: 1024 * 10000 }, function (err) {
            console.error("error is", err);

            done();
        }).stdout.pipe(process.stdout);

    }));

    gulp.task('install:update_tools', gulp.series(gulp.parallel('install:update_platformTools'), function (done) {
        if (limitedMode) {
            done();
            return;
        }

        console.log("installing platform tools");

        plugins.exec('echo y | sdkmanager "platform-tools" | grep -v = || true', done).stdout.pipe(process.stdout);
    }));


    gulp.task('install:update_buildTools', gulp.series(gulp.parallel('install:update_tools'), function (done) {
        console.log("install:update_buildTools");
        plugins.exec('echo y | sdkmanager "system-images;android-28;default;x86_64" | grep -v = || true', done).stdout.pipe(process.stdout);
        if (limitedMode) {
            done();
            return;
        }

    }));

    gulp.task('install:update_arm', gulp.series(gulp.parallel('install:update_buildTools'), function (done) {

        console.log("start install:update_arm");

        if (limitedMode) {
            done();
            return;
        }


        plugins.exec('echo y | sdkmanager "system-images;android-28;default;x86_64" | grep -v = || true', done).stdout.pipe(process.stdout);

    }));


    gulp.task('install:create_emulator', gulp.series(gulp.parallel('install:update_arm'), function (done) {
        console.log("start install:create_emulator");

        plugins.exec('echo n | avdmanager create avd -n test -k "system-images;android-28;default;x86_64" | grep -v = || true', done).stdout.pipe(process.stdout);


    }));


    gulp.task('install:updateapt', gulp.series(gulp.parallel('install:create_emulator'), function (done) {
        console.log("start install:32bit");
        plugins.exec('sudo apt-get update', done).stdout.pipe(process.stdout);

    }));

    gulp.task('install:32bit', gulp.series(gulp.parallel('install:updateapt'), function (done) {
        console.log("start install:32bit");
        plugins.exec('sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 zlib1g:i386 -y', done).stdout.pipe(process.stdout);

    }));

    gulp.task('install:android_sdk', gulp.series(gulp.parallel('install:32bit'), function (done) {
        console.log("start install:android_sdk");
        plugins.utils.log(plugins.utils.colors.cyan.bold("Yeay ! Android SDK have been successfully installed."));
        done();
    }));

    gulp.task('start:emulator', () => gulp.series(gulp.parallel('ensure:android'), function (done) {
        plugins.exec('emulator -avd test -no-audio -no-window &');

        /* Wait for the emulator to start */
        var waitForEmulatorToStart = function (nbTries, maxTries, callback) {
            plugins.utils.log("Waiting for the emulator to start...");
            plugins.exec('adb -e shell getprop init.svc.bootanim', function (err, stdout) {
                if (nbTries < maxTries && (stdout === null || stdout.match(/stopped/) === null)) {
                    setTimeout(waitForEmulatorToStart, 1000 * 30, nbTries + 1, maxTries, callback);
                } else if (nbTries >= maxTries) {
                    plugins.utils.abort("Emulator didn't start...", done);
                } else {
                    plugins.utils.log(plugins.utils.colors.cyan("Emulator has started."));
                    unlockScreen(1, 3, callback);
                }
            });
        };

        var unlockScreen = function (nbTries, maxTries, callback) {
            plugins.utils.log("Unlocking screen...");
            plugins.exec('adb -e shell input keyevent 82', function (err, stdout) {
                plugins.exec('adb -e shell dumpsys window windows | grep mCurrentFocus', function (err, stdout) {
                    if (nbTries < maxTries && stdout.match(/Keyguard/) !== null) {
                        setTimeout(unlockScreen, 1000 * 10, nbTries + 1, maxTries, callback);
                    } else if (nbTries >= maxTries) {
                        plugins.utils.abort("Unable to unlock screen", done);
                    } else {
                        plugins.utils.log(plugins.utils.colors.cyan("Screen unlocked."));
                        callback();
                    }
                });
            });
        };

        waitForEmulatorToStart(1, 30, function () {
            done();
            process.exit();
        });
    }));

};
