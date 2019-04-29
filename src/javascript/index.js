import './icons.js'

console.log('带事不好啦')

// function $(){    这是JS的写法，下面的是 ES6 的写法，这两种写法是等价的
//     return document.querySelector(selector)
//}

const $ = selector => document.querySelector(selector)  // 一个 $ 符表示选择一个,就是一个函数
const $$ = selector => document.querySelectorAll(selector)   // 两个 $$ 符表示选择全部

class Player {
    constructor(node) {
        this.root = typeof node === 'string' ? $(node) : node;    //传入的 root 是否是 string 类型，如果是的话就选择当前 node节点
        this.songList = []  //音乐歌单
        this.currentIndex = 0  //播放的音乐下标，根据下标确定播放哪一首
        this.audio = new Audio()
        //理论上是 start() 后已经可以正常播放的，但目前浏览器把自动播放禁掉了，手机上更不可能，所以需要创建一个 audio 对象来绑定对象后再进行播放
        this.start()    //播放器开始，看到这个 start 就运行
        this.bind()     //在 bind 内绑定按钮，实现上一首下一首的功能

    }

    start() {   //播放器开启
        fetch('https://jirengu.github.io/data-mock/huawei-music/music-list.json')
            //https://jirengu.github.io/data-mock/huawei-music/music-list.json 音乐线上地址，可以用于获取音乐列表
            //fetch 可以用于获取数据，会返回 Promise，在获取到后，可以使用 then 方法进行下一步需要的操作
            .then(res => res.json())    //用法，记住即可
            .then(data => {         //这个 data 里面存好了歌单
                console.log(data)
                this.songList = data    //把 data 内的歌单存入到 songList 内
            })

    }

    bind() {    //绑定按钮，让按钮有实际功能

        //播放暂停
        let self = this //一开始就让你等于 this
        this.root.querySelector('.btn-play-pause').onclick = function () {
            //播放的歌曲是 songList 内下标为 currentIndex 的歌曲
            //因为是在 bind 里面绑定的，并且要 click 才会触发，所以放在这里
            self.audio.src = self.songList[self.currentIndex].url

            //做判断，点击播放，在点击暂停
            if (this.classList.contains('playing')) {
                self.audio.pause()  //播放暂停
                this.classList.remove('playing')
                this.classList.add('pause')   //去掉 playing 加上 pause
                this.querySelector('use').setAttribute('xlink:href', '#icon-play')   //改显示图标

            } else if (this.classList.contains('pause')) {
                self.audio.play()   //播放开始
                this.classList.remove('pause')
                this.classList.add('playing')   //去掉 pause 加上 playing
                this.querySelector('use').setAttribute('xlink:href', '#icon-pause')  //改状态显示图标
            }
            //选中这个暂停按钮，从 root 里面找就不是全局的，很安全不会乱改掉别的东西
        }

        //上一曲
        this.root.querySelector('.btn-pre').onclick = function () {
            self.playPrevSong()
        }

        //下一曲
        this.root.querySelector('.btn-next').onclick = function () {
            self.playNextSong()
        }
    }

    playPrevSong() {    //播放上一首歌曲
        console.log(this.audio)
        this.currentIndex = (this.songList.length + this.currentIndex - 1) % this.songList.length //这个是别人想出来的，记下来就好了
        this.audio.src = this.songList[this.currentIndex].url   //播放上一首
        this.audio.play()
    }

    playNextSong() {    //播放下一首歌曲，与上一首是一样的
        console.log(this.audio)
        this.currentIndex = (this.songList.length + this.currentIndex + 1) % this.songList.length
        this.audio.src = this.songList[this.currentIndex].url
        this.audio.play()
    }

    playSong() {    //播放音乐

        this.audio.play()   //调用 play 方法播放当前歌曲
    }
}

new Player('#player')