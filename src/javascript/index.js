import './icons.js'     //导入图标
import Swiper from './swiper.js'    //导入手势库

console.log('带事不好啦')

// function $(){    这是JS的写法，下面的是 ES6 的写法，这两种写法是等价的
//     return document.querySelector(selector)
//}

// const $ = selector => document.querySelector(selector)  // 一个 $ 符表示选择一个,就是一个函数
// const $$ = selector => document.querySelectorAll(selector)   // 两个 $$ 符表示选择全部

class Player {
    constructor(node) {
        this.root = typeof node === 'string' ? document.querySelector(node) : node;    //传入的 root 是否是 string 类型，如果是的话就选择当前 node节点
        this.$ = selector => this.root.querySelector(selector)    //用 $ 代替 root.querySelector ，让代码看上去更简洁
        this.$$ = selector => this.root.querySelectorAll(selector) //用 $$ 代替 root.querySelectorAll
        this.songList = []  //音乐歌单
        this.currentIndex = 0  //播放的音乐下标，根据下标确定播放哪一首
        this.audio = new Audio()
        //理论上是 start() 后已经可以正常播放的，但目前浏览器把自动播放禁掉了，手机上更不可能，所以需要创建一个 audio 对象来绑定对象后再进行播放

        this.lyricsArr = []
        this.lyricIndex = -1

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
                this.loadSong()
            })
    }

    bind() {    //绑定按钮，让按钮有实际功能

        //播放暂停
        let self = this //一开始就让你等于 this
        this.$('.btn-play-pause').onclick = function () {

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
        this.$('.btn-pre').onclick = function () {
            self.currentIndex = (self.songList.length + self.currentIndex - 1) % self.songList.length
            self.loadSong()
            self.playSong()
        }

        //下一曲
        this.$('.btn-next').onclick = function () {
            self.currentIndex = (self.currentIndex + 1) % self.songList.length
            self.loadSong()
            self.playSong()
        }

        //准时更新歌词和作者
        this.audio.ontimeupdate = function () {
            console.log(parseInt(self.audio.currentTime * 1000))
            self.locateLyric()
            self.setProgerssBar()
        }

        //手势库，控制歌词整页和图标之间的滑动
        let swiper = new Swiper(this.$('.panels'))   //创建一个 swiper 对象要控制 panels
        swiper.on('swipLeft', function () {  //左滑
            this.classList.remove('panel1')
            this.classList.add('panel2')
        })
        swiper.on('swipRight', function () {  //右滑
            this.classList.remove('panel2')
            this.classList.add('panel1')
        })
    }

    loadSong() {   //加载音乐的时候再去获取到歌词和歌名等，所以多一个加载音乐步骤
        let songObj = this.songList[this.currentIndex]  //获取歌曲信息
        console.log(this)
        this.$('.header h1').innerText = songObj.title  //歌名
        this.$('.header p').innerText = songObj.author + '-' + songObj.albumn //作者 + 专辑
        this.audio.src = songObj.url   //获取歌曲
        this.audio.onloadedmetadata = () => this.$('.time-end').innerText = this.formateTime(this.audio.duration)
        //获取总时长duration，用formateTime进行格式化后，作为innerTex方法到 onloadedmetadata 中

        this.loadLyrics()   //加载歌词
    }

    playSong() {
        this.audio.oncanplaythrough = () => this.audio.play()
    }

    loadLyrics() {  //加载歌词
        fetch(this.songList[this.currentIndex].lyric)  //获取当前歌词
            .then(res => res.json())
            .then(data => {     //这个 data 里面存了歌词
                console.log(data.lrc.lyric)
                this.setLyrics(data.lrc.lyric)  //处理歌词
                window.lyrics = data.lrc.lyric
            })
    }

    locateLyric() {
        console.log('locateLyric')
        let currentTime = this.audio.currentTime * 1000
        let nextLineTime = this.lyricsArr[this.lyricIndex + 1][0]
        if (currentTime > nextLineTime && this.lyricIndex < this.lyricsArr.length - 1) {
            this.lyricIndex++
            let node = this.$('[data-time="' + this.lyricsArr[this.lyricIndex][0] + '"]')
            if (node) this.setLyricToCenter(node)
            this.$$('.panel-effect .lyric p')[0].innerText = this.lyricsArr[this.lyricIndex][1]
            this.$$('.panel-effect .lyric p')[1].innerText = this.lyricsArr[this.lyricIndex + 1] ? this.lyricsArr[this.lyricIndex + 1][1] : ''

        }
    }


    setLyrics(lyrics) {   //歌词滚动
        this.lyricIndex = 0
        let fragment = document.createDocumentFragment()
        let lyricsArr = []
        this.lyricsArr = lyricsArr
        lyrics.split(/\n/)
            .filter(str => str.match(/\[.+?\]/))
            .forEach(line => {
                let str = line.replace(/\[.+?\]/g, '')
                line.match(/\[.+?\]/g).forEach(t => {
                    t = t.replace(/[\[\]]/g, '')
                    let milliseconds = parseInt(t.slice(0, 2)) * 60 * 1000 + parseInt(t.slice(3, 5)) * 1000 + parseInt(t.slice(6))
                    lyricsArr.push([milliseconds, str])
                })
            })

        lyricsArr.filter(line => line[1].trim() !== '').sort((v1, v2) => {
            if (v1[0] > v2[0]) {
                return 1
            } else {
                return -1
            }
        }).forEach(line => {
            let node = document.createElement('p')
            node.setAttribute('data-time', line[0])
            node.innerText = line[1]
            fragment.appendChild(node)
        })
        this.$('.panel-lyrics .container').innerHTML = ''
        this.$('.panel-lyrics .container').appendChild(fragment)
    }

    setLyricToCenter(node) {
        console.log(node)
        let translateY = node.offsetTop - this.$('.panel-lyrics').offsetHeight / 2
        translateY = translateY > 0 ? translateY : 0
        this.$('.panel-lyrics .container').style.transform = `translateY(-${translateY}px)`
        this.$$('.panel-lyrics p').forEach(node => node.classList.remove('current'))
        node.classList.add('current')
    }


    setProgerssBar() {
        console.log('set setProgerssBar')
        let percent = (this.audio.currentTime * 100 / this.audio.duration) + '%'
        console.log(percent)
        this.$('.bar .progress').style.width = percent
        this.$('.time-start').innerText = this.formateTime(this.audio.currentTime)
        console.log(this.$('.bar .progress').style.width)
    }

    formateTime(secondsTotal) {
        let minutes = parseInt(secondsTotal / 60)
        minutes = minutes >= 10 ? '' + minutes : '0' + minutes
        let seconds = parseInt(secondsTotal % 60)
        seconds = seconds >= 10 ? '' + seconds : '0' + seconds
        return minutes + ':' + seconds
    }
}

window.Player = new Player('#player')