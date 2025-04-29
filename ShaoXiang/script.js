$(document).ready(function() {
    // 全局变量
    let selectedIncense = null;
    let prayCount = 0;
    let wishes = [];
    let audioContext;
    let isMuted = false;
    
    // 初始化音频上下文
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
    } catch(e) {
        console.warn('Web Audio API不受支持。网站将在无声模式下运行。', e);
    }
    
    // 创建光粒子
    function createLightParticles(container, count) {
        container = $(container);
        for (let i = 0; i < count; i++) {
            const x = Math.random() * 100 - 50; // 在屏幕范围内随机位置
            const y = Math.random() * 100 - 50;
            
            const particle = $('<div>')
                .addClass('light-particle')
                .css({
                    left: `calc(50% + ${x}%)`,
                    top: `calc(50% + ${y}%)`,
                    animationDelay: `${Math.random() * 10}s`,
                    opacity: Math.random() * 0.5 + 0.2
                });
            
            container.append(particle);
        }
    }
    
    // 初始化光粒子
    createLightParticles('#light-particles-container', 30);
    createLightParticles('#light-particles-container-fulfill', 30);
    
    // 播放音效
    function playSound(type) {
        if (isMuted || !audioContext) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'select':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
                break;
                
            case 'light':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.8);
                break;
                
            case 'pray':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'submit':
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.1);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    }
    
    // 本地存储
    function loadWishes() {
        const savedWishes = localStorage.getItem('cyberprayerwishes');
        if (savedWishes) {
            wishes = JSON.parse(savedWishes);
            renderWishes();
        }
    }
    
    function saveWishes() {
        localStorage.setItem('cyberprayerwishes', JSON.stringify(wishes));
    }
    
    // 渲染漂浮的愿望
    function renderWishes() {
        $('#wish-floating-container').empty();
        $('#wish-floating-container-fulfill').empty();
        
        wishes.forEach((wish, index) => {
            // 为每个愿望计算一个随机位置，调整范围使其更分散
            const x = Math.random() * 240 - 120; // 扩大分布范围
            const y = Math.random() * 200 - 100;
            
            const wishElement = $('<div>')
                .addClass('floating-wish')
                .attr('data-id', index)
                .text(index + 1)
                .css({
                    'left': `calc(50% + ${x}px)`,
                    'top': `calc(50% + ${y}px)`,
                    'transform': 'translate(-50%, -50%) scale(0)',
                    'animation-delay': (Math.random() * 2) + 's',
                    'z-index': 20 // 确保z-index值足够高
                });
            
            const wishClone = wishElement.clone();
            
            $('#wish-floating-container').append(wishElement);
            $('#wish-floating-container-fulfill').append(wishClone);
            
            // 添加出现动画
            setTimeout(() => {
                wishElement.css({
                    'transform': 'translate(-50%, -50%) scale(1)',
                    'transition': 'transform 0.5s ease-out'
                });
                wishClone.css({
                    'transform': 'translate(-50%, -50%) scale(1)',
                    'transition': 'transform 0.5s ease-out'
                });
            }, index * 100);
        });
    }
    
    // 添加声音控制开关
    $('<div>')
        .addClass('sound-toggle')
        .html('<i class="fas fa-volume-up"></i>')
        .css({
            'position': 'absolute',
            'top': '20px',
            'left': '20px',
            'width': '40px',
            'height': '40px',
            'background-color': 'rgba(255, 255, 255, 0.7)',
            'border-radius': '50%',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'cursor': 'pointer',
            'z-index': '1000'
        })
        .appendTo('#temple-container')
        .click(function() {
            isMuted = !isMuted;
            $(this).html(isMuted ? '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>');
            
            // 如果未初始化音频上下文，用户交互时初始化
            if (audioContext && audioContext.state === 'suspended') {
                audioContext.resume();
            }
        });
    
    // 添加字体图标
    $('<link>')
        .attr('rel', 'stylesheet')
        .attr('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css')
        .appendTo('head');
    
    // 处理佛像图片加载
    $('.buddha-fallback').on('error', function() {
        // 图片加载失败时，使用文字替代
        $(this).hide();
        $(this).parent().addClass('buddha-fallback-text');
    });
    
    // 初始化
    loadWishes();
    
    // 主界面按钮
    $('#make-wish-btn').click(function() {
        $('#welcome-screen').addClass('hidden');
        $('#wish-screen').removeClass('hidden');
        
        // 添加进入动画
        $('#wish-screen').css({
            'opacity': '0'
        }).animate({
            'opacity': '1'
        }, 800);
        
        playSound('select');
    });
    
    $('#fulfill-wish-btn').click(function() {
        $('#welcome-screen').addClass('hidden');
        $('#fulfill-screen').removeClass('hidden');
        
        // 添加进入动画
        $('#fulfill-screen').css({
            'opacity': '0'
        }).animate({
            'opacity': '1'
        }, 800);
        
        playSound('select');
    });
    
    // 返回按钮
    $('.back-button').click(function() {
        // 退出动画
        const currentScreen = $(this).closest('.hidden, #wish-screen, #fulfill-screen');
        
        currentScreen.animate({
            'opacity': '0'
        }, 800, function() {
            $('.hidden').removeClass('hidden');
            $('#wish-screen').addClass('hidden');
            $('#fulfill-screen').addClass('hidden');
            $('#welcome-screen').removeClass('hidden');
            
            // 重置许愿状态
            selectedIncense = null;
            prayCount = 0;
            $('.incense').removeClass('selected burning');
            $('#pray-count').text('0/3');
            $('#wish-input-container').addClass('hidden');
            
            // 清理所有产生的效果元素
            $('.smoke-container, .fire-container').remove();
            
            // 重置变换
            $(this).css({
                'opacity': '1'
            });
        });
        
        playSound('select');
    });
    
    // 选择香
    $('.incense').click(function() {
        if (selectedIncense) return;
        
        selectedIncense = $(this);
        $('.incense').removeClass('selected');  // 确保只有一个香被选中
        $(this).addClass('selected');
        
        // 添加提示动画
        $('<div>')
            .addClass('tip-text')
            .text('拖动到火盆点燃')
            .css({
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                padding: '5px 10px',
                borderRadius: '5px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                zIndex: 10,
                opacity: 0
            })
            .appendTo($(this))
            .animate({ opacity: 1 }, 300)
            .delay(2000)
            .fadeOut(500, function() {
                $(this).remove();
            });
        
        // 选中效果
        $(this).css({
            'transform': 'scale(1.1)'
        });
        
        // 允许拖动
        $(this).draggable({
            helper: 'original',
            revert: 'invalid',
            zIndex: 1000,
            start: function(event, ui) {
                $(this).css({
                    'z-index': 1000,
                    'cursor': 'grabbing'
                });
                
                // 高亮火盆作为可放置区域
                $('#incense-fire').addClass('can-drop');
            },
            stop: function(event, ui) {
                $(this).css({
                    'z-index': '',
                    'cursor': 'grab'
                });
                
                // 移除火盆高亮
                $('#incense-fire').removeClass('can-drop');
            }
        });
        
        playSound('select');
    });
    
    // 火盆可放置香
    $('#incense-fire').droppable({
        accept: '.incense',
        tolerance: 'touch',  // 更宽松的放置检测
        hoverClass: 'can-drop',
        drop: function(event, ui) {
            const incense = ui.draggable;
            
            // 计算放置位置
            const firePos = $(this).offset();
            const fireCenter = {
                x: firePos.left + $(this).width() / 2,
                y: firePos.top + 10 // 火盆上方
            };
            
            // 设置香的位置
            incense.css({
                left: fireCenter.x - incense.width() / 2,
                top: fireCenter.y - incense.height() - 10,
                position: 'absolute'
            });
            
            // 显示点燃成功的提示
            $('<div>')
                .addClass('success-message')
                .text('香已点燃')
                .appendTo('#wish-screen')
                .fadeIn()
                .delay(1500)
                .fadeOut(function() {
                    $(this).remove();
                });
            
            // 点燃香
            incense.removeClass('selected').addClass('burning');
            
            // 移除拖动功能
            incense.draggable('destroy');
            
            // 修改这里，确保设置正确的状态
            selectedIncense = 'burning';
            console.log("香被点燃，状态更新为:", selectedIncense);
            
            // 添加烟雾效果
            createSmoke(incense);
            
            // 添加火焰粒子效果
            createFireParticles(incense);
            
            playSound('light');
        }
    });
    
    // 创建烟雾效果
    function createSmoke(incense) {
        const smokeContainer = $('<div>').addClass('smoke-container').css({
            position: 'absolute',
            top: incense.position().top - 30,
            left: incense.position().left + incense.width() / 2 - 10,
            width: 20,
            height: 30,
            pointerEvents: 'none',
            zIndex: 10
        });
        
        $('#wish-screen').append(smokeContainer);
        
        const createSmokeParticle = () => {
            const smoke = $('<div>').addClass('smoke-particle').css({
                width: Math.random() * 10 + 10 + 'px',
                height: Math.random() * 10 + 10 + 'px',
                opacity: Math.random() * 0.4 + 0.1,
                backgroundColor: 'rgba(200, 200, 200, 0.5)',
                borderRadius: '50%',
                position: 'absolute',
                left: Math.random() * 10 - 5 + 'px',
                bottom: '0px'
            });
            
            smokeContainer.append(smoke);
            
            smoke.animate({
                bottom: '+=' + (Math.random() * 80 + 40),
                left: '+=' + (Math.random() * 40 - 20),
                opacity: 0
            }, 2000, function() {
                $(this).remove();
            });
        };
        
        // 创建烟雾粒子
        const smokeInterval = setInterval(createSmokeParticle, 100);
        
        // 30秒后停止烟雾
        setTimeout(() => {
            clearInterval(smokeInterval);
            smokeContainer.remove();
        }, 30000);
    }
    
    // 创建火焰粒子效果
    function createFireParticles(incense) {
        const fireContainer = $('<div>').addClass('fire-container').css({
            position: 'absolute',
            top: incense.position().top - 20,
            left: incense.position().left - 5,
            width: 20,
            height: 20,
            pointerEvents: 'none',
            zIndex: 9
        });
        
        $('#wish-screen').append(fireContainer);
        
        const createFireParticle = () => {
            const size = Math.random() * 6 + 3;
            const fire = $('<div>').css({
                width: size + 'px',
                height: size + 'px',
                backgroundColor: `rgba(${Math.floor(Math.random() * 55 + 200)}, ${Math.floor(Math.random() * 100 + 50)}, 0, ${Math.random() * 0.4 + 0.6})`,
                borderRadius: '50%',
                position: 'absolute',
                left: Math.random() * 20 - 10 + 'px',
                bottom: '0px',
                boxShadow: '0 0 3px rgba(255, 100, 0, 0.8)'
            });
            
            fireContainer.append(fire);
            
            fire.animate({
                bottom: '+=' + (Math.random() * 20 + 10),
                left: '+=' + (Math.random() * 20 - 10),
                opacity: 0,
                width: 0,
                height: 0
            }, 1000, function() {
                $(this).remove();
            });
        };
        
        // 创建火焰粒子
        const fireInterval = setInterval(createFireParticle, 50);
        
        // 与烟雾一起停止
        setTimeout(() => {
            clearInterval(fireInterval);
            fireContainer.remove();
        }, 30000);
    }
    
    // 完全重写拜佛按钮功能
    $('#pray-btn').off('click').on('click', function() {
        console.log("拜佛按钮被点击", selectedIncense);
        
        // 检查是否有香被点燃
        if (selectedIncense !== 'burning') {
            alert('请先取香并点燃它');
            return;
        }
        
        prayCount++;
        $('#pray-count').text(prayCount + '/3');
        console.log("拜佛计数:", prayCount);
        
        // 佛像动画效果
        $('#buddha').css({
            'transform': 'scale(1.1)',
            'filter': 'drop-shadow(0 0 15px rgba(255, 215, 0, 0.8))'
        });
        
        // 添加光环效果
        const halo = $('<div>').css({
            position: 'absolute',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,215,0,0.6) 0%, rgba(255,215,0,0) 70%)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) scale(0)',
            opacity: 0,
            zIndex: 5
        }).appendTo('#buddha');
        
        // 光环动画
        halo.animate({
            transform: 'translate(-50%, -50%) scale(2)',
            opacity: 0.8
        }, 300, function() {
            $(this).animate({
                opacity: 0
            }, 300, function() {
                $(this).remove();
            });
        });
        
        // 恢复佛像状态
        setTimeout(() => {
            $('#buddha').css({
                'transform': 'scale(1)',
                'filter': 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))'
            });
        }, 300);
        
        // 播放音效
        playSound('pray');
        
        // 拜三次后显示愿望输入框
        if (prayCount >= 3) {
            setTimeout(() => {
                $('#wish-input-container').removeClass('hidden').css({
                    'opacity': '0',
                    'transform': 'translateY(20px)'
                }).animate({
                    'opacity': '1',
                    'transform': 'translateY(0)'
                }, 500);
            }, 500);
        }
    });
    
    // 提交愿望
    $('#submit-wish-btn').click(function() {
        const wishText = $('#wish-text').val().trim();
        
        if (!wishText) {
            alert('请输入您的愿望');
            return;
        }
        
        // 添加新愿望
        wishes.push({
            text: wishText,
            date: new Date().toISOString()
        });
        
        saveWishes();
        
        // 添加愿望动画，调整位置范围
        const x = Math.random() * 240 - 120; 
        const y = Math.random() * 200 - 100;
        
        const newWish = $('<div>')
            .addClass('floating-wish')
            .attr('data-id', wishes.length - 1)
            .text(wishes.length)
            .css({
                'left': '50%',
                'top': '50%',
                'transform': 'translate(-50%, -50%) scale(0)',
                'z-index': 20 
            });
        
        $('#wish-floating-container').append(newWish);
        $('#wish-floating-container-fulfill').append(newWish.clone());
        
        // 愿望释放动画
        setTimeout(() => {
            $('.floating-wish:last-child').css({
                'left': `calc(50% + ${x}px)`,
                'top': `calc(50% + ${y}px)`,
                'transform': 'translate(-50%, -50%) scale(1)',
                'transition': 'all 1s ease-out'
            });
            
            // 创建光线效果
            createLightBeam();
        }, 100);
        
        playSound('submit');
        
        // 重置界面和状态
        $('#wish-text').val('');
        $('#wish-input-container').addClass('hidden');
        
        // 显示成功消息
        $('<div>')
            .addClass('success-message')
            .text('愿望已送达佛前')
            .appendTo('#buddha-area')
            .fadeIn()
            .delay(2000)
            .fadeOut(function() {
                $(this).remove();
            });
        
        // 清理当前点燃的香
        $('.incense.burning').fadeOut(500, function() {
            $(this).remove();
        });
        
        // 重置拜佛计数和香的状态
        prayCount = 0;
        $('#pray-count').text('0/3');
        selectedIncense = null;
        
        // 添加替代的新香
        const newIncense = $('<div>')
            .addClass('incense')
            .attr('id', 'incense-new-' + Date.now())
            .css('opacity', '0');
        
        $('#incense-box').append(newIncense);
        
        // 新香淡入效果
        newIncense.animate({
            opacity: 1
        }, 500, function() {
            // 使新香可拖动
            $(this).click(function() {
                if (selectedIncense) return;
                
                selectedIncense = $(this);
                $('.incense').removeClass('selected');
                $(this).addClass('selected');
                
                // 添加提示动画
                $('<div>')
                    .addClass('tip-text')
                    .text('拖动到火盆点燃')
                    .css({
                        position: 'absolute',
                        top: '-30px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        padding: '5px 10px',
                        borderRadius: '5px',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        opacity: 0
                    })
                    .appendTo($(this))
                    .animate({ opacity: 1 }, 300)
                    .delay(2000)
                    .fadeOut(500, function() {
                        $(this).remove();
                    });
                
                // 选中效果
                $(this).css({
                    'transform': 'scale(1.1)'
                });
                
                // 允许拖动
                $(this).draggable({
                    helper: 'original',
                    revert: 'invalid',
                    zIndex: 1000,
                    start: function(event, ui) {
                        $(this).css({
                            'z-index': 1000,
                            'cursor': 'grabbing'
                        });
                        
                        // 高亮火盆作为可放置区域
                        $('#incense-fire').addClass('can-drop');
                    },
                    stop: function(event, ui) {
                        $(this).css({
                            'z-index': '',
                            'cursor': 'grab'
                        });
                        
                        // 移除火盆高亮
                        $('#incense-fire').removeClass('can-drop');
                    }
                });
                
                playSound('select');
            });
        });
        
        // 显示提示消息
        setTimeout(() => {
            $('<div>')
                .addClass('tip-text')
                .text('您可以继续许新的愿望')
                .css({
                    position: 'absolute',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px 15px',
                    borderRadius: '5px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    opacity: 0
                })
                .appendTo('#wish-screen')
                .animate({ opacity: 1 }, 300)
                .delay(3000)
                .fadeOut(500, function() {
                    $(this).remove();
                });
        }, 2500);
    });
    
    // 创建光束效果
    function createLightBeam() {
        const beam = $('<div>').css({
            position: 'absolute',
            width: '2px',
            height: '0',
            backgroundColor: 'rgba(255, 215, 0, 0.8)',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, 0)',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
            zIndex: 8
        }).appendTo('#buddha-area');
        
        beam.animate({
            height: '200px'
        }, 500, function() {
            setTimeout(() => {
                $(this).animate({
                    opacity: 0
                }, 500, function() {
                    $(this).remove();
                });
            }, 500);
        });
    }
    
    // 提交还愿
    $('#submit-fulfill-btn').click(function() {
        const fulfillText = $('#fulfill-text').val().trim();
        
        if (!fulfillText) {
            alert('请输入您的还愿内容');
            return;
        }
        
        if (wishes.length === 0) {
            alert('您还没有许过愿望');
            return;
        }
        
        // 移除动画
        const lastWish = $('.floating-wish:last-child');
        lastWish.css({
            'transform': 'translate(-50%, -50%) scale(0)',
            'transition': 'transform 0.8s ease-in'
        });
        
        // 创建光线效果
        const beam = $('<div>').css({
            position: 'absolute',
            width: '2px',
            height: '0',
            backgroundColor: 'rgba(255, 215, 0, 0.8)',
            left: lastWish.css('left'),
            top: lastWish.css('top'),
            transform: 'translateZ(0)',
            boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
            zIndex: 8
        }).appendTo('#buddha-area-fulfill');
        
        beam.animate({
            height: '200px'
        }, 500, function() {
            setTimeout(() => {
                $(this).animate({
                    opacity: 0
                }, 500, function() {
                    $(this).remove();
                });
            }, 500);
        });
        
        // 移除一个愿望
        setTimeout(() => {
            wishes.pop();
            saveWishes();
            renderWishes();
        }, 800);
        
        playSound('submit');
        
        // 重置输入
        $('#fulfill-text').val('');
        
        // 显示成功消息
        $('<div>')
            .addClass('success-message')
            .text('还愿成功，佛祖已收到您的诚意')
            .appendTo('#buddha-area-fulfill')
            .fadeIn()
            .delay(2000)
            .fadeOut(function() {
                $(this).remove();
            });
    });
    
    // 鼠标悬停在漂浮愿望上显示内容
    $(document).on('mouseenter', '.floating-wish', function() {
        const id = $(this).data('id');
        if (id !== undefined && wishes[id]) {
            $('<div>')
                .addClass('wish-tooltip')
                .text(wishes[id].text)
                .css({
                    position: 'absolute',
                    top: $(this).position().top + $(this).height() + 5,
                    left: $(this).position().left,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    maxWidth: '200px',
                    wordWrap: 'break-word',
                    opacity: 0,
                    transform: 'translateY(10px)'
                })
                .appendTo($(this).parent())
                .animate({
                    opacity: 1,
                    transform: 'translateY(0px)'
                }, 200);
        }
    }).on('mouseleave', '.floating-wish', function() {
        $('.wish-tooltip').fadeOut(200, function() {
            $(this).remove();
        });
    });
    
    // 添加CSS样式
    $('<style>')
        .text(`
            .smoke-particle {
                transition: none;
            }
            .success-message {
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(255, 255, 255, 0.9);
                padding: 10px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                display: none;
                z-index: 100;
            }
            @keyframes glow {
                0%, 100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
                50% { filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
            }
            #buddha, #buddha-fulfill {
                animation: glow 3s infinite;
            }
            #wish-screen, #fulfill-screen {
                transition: opacity 0.8s;
            }
        `)
        .appendTo('head');
}); 