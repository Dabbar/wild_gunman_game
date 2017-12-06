(function() {
    // HTML elements
    var gunman = document.querySelector('.gunman');
    var credits = document.querySelector('.credits');
    var playerTime = document.querySelector('.player-time');
    var back = document.querySelector('.main__back');
    var startBtn = document.querySelector('.start__btn');
    var reward = document.querySelector('.reward');
    var logo = document.querySelector('.logo');
    var blackBack = document.querySelector('.black-back');
    var hat = document.querySelector('.hat');
    var gameOver = document.querySelector('.gameOver');
    var messageWon = document.querySelector('.won');
    var messageLost = document.querySelector('.lost');
    var messageFoul = document.querySelector('.foul');
    var messageFire = document.querySelector('.fire');
    var messages = document.querySelectorAll('.message');
    var gunmanTime = document.querySelector('.gunman-time');
    var resultForm = document.querySelector('#result-form');
    var resultsTable = document.querySelector('#results-table');
    var resultsBody = document.querySelector('#results-body');
    var scoreHolder = document.querySelector('.score-holder');
    var lvlVal = document.querySelector('#lvl-val');
    var loader = document.querySelector('.loader');
    var githubLink = document.querySelector('.github-link');

    // Variables
    var timeDiff;
    var timeStart;
    var timeEnd;
    var gunmanNumber;
    var kills = 0;
    var score = 0;
    var currentReward = 0;
    var gunmanTiming;
    var direction;
    var uniqueRandomGunmen = [];
    var numRandoms = 6;

    // Timers
    var timer1;
    var timer2;
    var timer3;
    var timer4;
    var timer5;

    // State
    var gameIsOver = false;
    var level = 1;
    var oldLevel = 1;
    var formSent = false;

    // audios
    var morricone = document.getElementById('morricone');
    var intro = document.getElementById('intro');
    var fire = document.getElementById('fire');
    var wait = document.getElementById('wait');
    var win = document.getElementById('win');
    var death = document.getElementById('death');
    var foul = document.getElementById('foul');
    var shot = document.getElementById('shot');
    var shotFall = document.getElementById('shotFall');

    // Listeners
    startBtn.addEventListener('click', function(e) {
        if (!formSent && gameIsOver && kills > 0) {
            onSubmit(e);
        } else {
            start();
        }
    });

    // Helpers
    function getRandomInt(min, max) {
        if (min < 0) {
            min = 0;
        }
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function easeOutQuart(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }

    function animateNum(hook, value, startValue, duration, decimal) {
        startValue = startValue || 0;
        duration = duration || 1000;
        var endValue = value - startValue;
        var time = {
            total: duration,
            start: performance.now()
        };

        function tick(now) {
            var elapsed = now - time.start;
            var progress = easeOutQuart(elapsed, 0, 1, time.total);

            if (decimal != null) {
                hook.textContent = (startValue + progress * endValue).toFixed(decimal);
            } else {
                hook.textContent = Math.round(startValue + progress * endValue);
            }
            elapsed < time.total ? window.requestAnimationFrame(tick) : null;
        }

        window.requestAnimationFrame(tick);
    }

    function makeUniqueRandom(uniqueRandomGunmen) {
        if (!uniqueRandomGunmen.length) {
            for (var i = 1; i <= numRandoms; i++) {
                uniqueRandomGunmen.push(i);
            }
        }
        var index = Math.floor(Math.random() * uniqueRandomGunmen.length);
        var val = uniqueRandomGunmen[index];

        uniqueRandomGunmen.splice(index, 1);

        return val;
    }

    // Game functions
    function reset() {
        gunman.style.cssText = '';
        back.style.cssText = '';
        hat.style.cssText = '';
        gameOver.style.cssText = '';

        resultForm.classList.remove('visible');
        startBtn.classList.add('over');
        startBtn.classList.add('hidden');
        resultsTable.classList.remove('visible');
        startBtn.classList.remove('with-table');
        gameOver.classList.remove('with-table');

        for (var i = 0; i < messages.length; i++) {
            messages[i].style.cssText = '';
        }
        playerTime.textContent = '0.00';
        gunmanNumber = makeUniqueRandom(uniqueRandomGunmen);
        formSent = false;
    }

    function goIntoScreen() {
        var side = '';

        if (getRandomInt(0, 1) > 0) {
            direction = 'left';
        } else {
            direction = 'right';
        }

        if (direction === 'right') {
            gunman.style.cssText = 'right: -106px;' + 'transform: translate(-449px, 0);';
        } else {
            if (gunmanNumber === 1) {
                side = 'Left';
            }
            gunman.style.cssText = 'left: -1004px;' + 'transform: translate(449px, 0);';
        }

        gunman.style.cssText +=
            ' transition: transform 5s linear;' +
            ' animation: goInto 0.5s steps(3) 10 ;' +
            'background-image: url("images/g' +
            gunmanNumber +
            side +
            '.png");';
    }

    function goBack() {
        if (gunmanNumber === 1 || direction === 'left') {
            gunman.style.cssText = 'transform: translate(-449px, 0);';
        } else {
            gunman.style.cssText = 'transform: translate(449px, 0);';
        }

        gunman.style.cssText +=
            'background-image: url("images/g' +
            gunmanNumber +
            '.png");' +
            ' transition: transform 4s linear;' +
            'left: 0;' +
            'right:0;' +
            ' animation: goBack 0.5s steps(3) 8;';
    }

    function clearDeadBody() {
        gunman.style.cssText = 'right:-106;';
        hat.style.display = 'none';
    }

    function lost() {
        gameIsOver = true;
        resultForm.score.value = score;
        resultForm.kills.value = kills;

        gunman.style.cssText =
            'animation: lost 0.8s steps(2) 2; ' +
            'background-image: url("images/g' +
            gunmanNumber +
            'Lost.png");' +
            'left: 0;' +
            'right: 0;';

        messageLost.style.display = 'block';
        currentReward = 0;
    }

    function won() {
        var oldScore = score;
        kills += 1;
        score += currentReward;
        oldLevel = level;
        // Increasing level
        if (kills === 2) {
            level = 2;
        } else if (kills === 4) {
            level = 3;
        } else if (kills === 6) {
            level = 4;
        } else if (kills === 8) {
            level = 5;
        } else if (kills === 10) {
            level = 6;
        } else if (kills === 12) {
            level = 7;
        } else if (kills === 14) {
            level = 8;
        }

        animateNum(scoreHolder, score, oldScore);
        animateNum(reward, 0, currentReward);

        if (gunmanNumber === 1 || gunmanNumber === 6) {
            hat.src = 'images/g' + gunmanNumber + 'Hat.png';
            hat.style.cssText = 'animation: hatG1 2s 1;' + 'display: block;' + 'top: 265px;';
            gunman.style.cssText = 'animation: won 1.2s steps(1) 1;' + 'animation-fill-mode: forwards;';
        } else if (gunmanNumber === 3) {
            hat.src = 'images/g' + gunmanNumber + 'Hat.png';
            hat.style.cssText = 'animation: hatG3 2s 1;' + 'display: block;' + 'top: -46px;';
        } else if (gunmanNumber === 4) {
            hat.src = 'images/g' + gunmanNumber + 'Hat.png';
            hat.style.cssText = 'animation: hatG4 4s 1;' + 'display: block;' + 'top: -46px;';
            gunman.style.cssText = ' animation: wonG4 1.2s 1 ease-out ;';
        } else if (gunmanNumber === 5) {
            hat.src = 'images/g' + gunmanNumber + 'Hat.png';
            hat.style.cssText = 'animation: hatG5 4s 1 ease-out;' + 'display: block;' + 'top: -46px;';
            gunman.style.cssText = ' animation: won 1.2s steps(1) 1;' + 'animation-fill-mode: forwards;';
        }
        gunman.style.cssText += 'left: 0;' + 'right: 0;' + 'background-image: url("images/g' + gunmanNumber + 'Won.png");';
        messageWon.style.display = 'block';
    }

    function stop() {
        gunman.style.cssText = 'background-image: url("images/g' + gunmanNumber + 'Stop.png");' + 'left: 0;' + 'right: 0;';
    }

    function over() {
        gameOver.style.visibility = 'visible';
        startBtn.style.color = 'white';
        blackBack.style.display = 'hidden';
        gunman.style.cssText = '';

        if (kills > 0) {
            resultForm.classList.add('visible');
            resultForm.name.focus();
            startBtn.textContent = 'Submit';
        } else {
            getResultsList().then(function(data) {
                startBtn.classList.add('with-table');
                resultsTable.classList.add('visible');
                gameOver.classList.add('with-table');

                drawTable(resultsBody, data.slice(0, 5));
            });
        }
        startBtn.classList.remove('hidden');

        for (var i = 0; i < messages.length; i++) {
            messages[i].style.cssText = '';
        }
    }

    // Rounds
    function waitRound() {
        wait.currentTime = 0;
        wait.play();

        stop();

        back.onclick = function() {
            shot.currentTime = 0;
            shot.play();
            foul.currentTime = 0;
            foul.play();

            messageFoul.style.display = 'block';

            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);

            lost();

            setTimeout(goBack, 3000);
            setTimeout(over, 7000);
            back.onclick = '';
        };
    }

    function fireRound() {
        fire.currentTime = 0;
        fire.play();

        messageFire.style.display = 'block';

        back.onclick = '';

        timeStart = Date.now();

        gunman.style.cssText = 'background-image: url("images/g' + gunmanNumber + 'Alert.png");' + 'left: 0;' + 'right: 0;';

        // Checking for shot
        gunman.onclick = function checkShot() {
            shotFall.currentTime = 0;
            shotFall.play();

            back.style.cssText = 'animation: backFlickr 0.21s 3;';

            timeEnd = Date.now();
            timeDiff = (timeEnd - timeStart) / 1000;
            timeDiff = timeDiff.toFixed(2);
            animateNum(playerTime, timeDiff, 0, 500, 2);

            won();
            win.currentTime = 0;
            win.play();

            clearTimeout(timer3);
            clearTimeout(timer4);
            clearTimeout(timer5);

            gunman.onclick = '';

            messageFire.style.display = '';

            setTimeout(clearDeadBody, 4000);

            setTimeout(start, 5000);
        };
    }

    function gotKilled() {
        shot.currentTime = 0;
        shot.play();
        death.currentTime = 0;
        death.play();

        messageFire.style.display = '';
        gunman.onclick = '';
        back.style.cssText = 'animation: backFlickr 0.2s 3;';

        setTimeout(function() {
            back.style.cssText = '  background-color: red;' + 'background-blend-mode: multiply;';
        }, 210);
        lost();
    }

    // Starting game
    morricone.loop = true;
    morricone.currentTime = 0;
    morricone.play();

    function start() {
        morricone.pause();
        morricone.currentTime = 0;

        startBtn.textContent = 'Play again';

        if (gameIsOver) {
            score = 0;
            kills = 0;
            scoreHolder.textContent = 0;
            level = 1;
        }
        gameIsOver = false;

        reset();

        currentReward = 1000 * getRandomInt(level - 3, level) + 3000;
        animateNum(reward, currentReward);
        animateNum(lvlVal, level, oldLevel);

        // Gunman timing depend on level
        gunmanTiming = getRandomInt(9 - level, 10 - level) / 10;
        animateNum(gunmanTime, gunmanTiming, 0, 500, 2);

        // credits.classList.add('hidden');
        githubLink.classList.add('hidden');
        startBtn.classList.add('hidden');
        logo.style.visibility = 'hidden';
        blackBack.style.visibility = 'visible';

        // Gunman steps into
        goIntoScreen();
        intro.currentTime = 0;
        intro.play();

        // Stop and check foul
        timer1 = setTimeout(waitRound, 5000);
        // Alert before shot
        timer2 = setTimeout(fireRound, 6000);
        // Lost
        timer3 = setTimeout(gotKilled, 6000 + gunmanTiming * 1000);
        // Stop after loss
        timer4 = setTimeout(stop, 10000);
        // Go from screen
        timer5 = setTimeout(function() {
            goBack();
            setTimeout(over, 6000);
        }, 11000);
    }

    // XHR functions
    function sendCurGameResult(data) {
        loader.style.visibility = 'visible';

        return fetch('/game/add', {
            body: data,
            method: 'POST'
        }).then(function(res) {
            loader.style.visibility = 'hidden';

            return res.json();
        });
    }

    function getResultsList() {
        loader.style.visibility = 'visible';

        return fetch('/game/list').then(function(res) {
            loader.style.visibility = 'hidden';

            return res.json();
        });
    }

    function getYourGame(yourId) {
        loader.style.visibility = 'visible';

        return fetch('/game/get', {
            body: JSON.stringify({ idx: yourId }),
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }).then(function(res) {
            loader.style.visibility = 'hidden';

            return res.json();
        });
    }

    function drawTable(hook, data, yourId, yourPosition) {
        hook.innerHTML = data
            .map(function(result, idx) {
                return (
                    '<tr ' +
                    (result.id === yourId ? 'class="yours"' : '') +
                    '><td>' +
                    (result.id === yourId ? yourPosition + 1 : idx + 1) +
                    '</td><td class="name" title="' +
                    result.name +
                    '">' +
                    result.name +
                    '</td><td>' +
                    result.kills +
                    '</td><td class="tb-score" title="' +
                    result.score +
                    '">$ ' +
                    result.score +
                    '</td></tr>'
                );
            })
            .join('');
    }

    function onSubmit(e) {
        var data = new FormData(resultForm);
        var resultArr = [];
        var allResults = [];
        var yourId = null;
        var yourPosition = null;

        e.preventDefault();

        return sendCurGameResult(data)
            .then(function(data) {
                loader.style.visibility = 'hidden';

                formSent = true;

                yourId = data.idx;
                resultForm.name.value = '';
                resultForm.classList.remove('visible');

                getResultsList().then(function(data) {
                    loader.style.visibility = 'hidden';

                    startBtn.classList.add('with-table');
                    resultsTable.classList.add('visible');
                    gameOver.classList.add('with-table');

                    resultArr = data.slice(0, 5);
                    allResults = [].concat(data);
                    yourPosition = allResults.findIndex(function(el) {
                        return el.id === yourId;
                    });

                    getYourGame(yourId).then(function(data) {
                        loader.style.visibility = 'hidden';

                        if (
                            resultArr.findIndex(function(el) {
                                return el.id === yourId;
                            }) === -1
                        ) {
                            resultArr = resultArr.concat(data);
                        }

                        resultArr.sort(function(a, b) {
                            return b.score - a.score;
                        });

                        drawTable(resultsBody, resultArr, yourId, yourPosition);
                        startBtn.textContent = 'Play again';
                    });
                });
            })
            .catch(function(e) {
                console.error(e);
            });
    }

    resultForm.addEventListener('submit', onSubmit);
})();
