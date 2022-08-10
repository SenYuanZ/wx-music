// pages/songDetail/songDetail.js
import request from '../../../utils/request'
import PubSub from 'pubsub-js'
import moment from 'moment'
// 获取全局实例
const appInstance = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isPlay: false, //音乐是否播放
		song: {}, //歌曲详情对象
		musicId: '', //音乐的id
		musicLink: '', //音乐的链接
		currentTime: '00:00', // 实时时间
		durationTime: '00:00', // 总时长
		currentWidth: 0, //实时进度条宽度
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		// options：专门接收路由跳转的query参数
		// 原生小程序中路由传参，对参数长度有限制，参数长度过长就会自动截取掉
		let musicId = options.musicId
		this.setData({
			musicId
		})
		// 获取歌曲详情
		this.getMusicInfo(musicId)



		/* 
			问题：如果用户操作系统的控制音乐播放/暂停、页面不知道、导致页面显示和播放状态不一致
			解决方案：
				1.通过控制音频的实例backgroundAudioManager 去监视音乐播放/暂停
		*/

		// 判断当前页面音乐是否再播放
		if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
			//修改当前页面的音乐播放状态为true
			this.setData({
				isPlay: true
			})
		}

		// 创建控制音乐播放的实例对象
		this.backgroundAudioManager = wx.getBackgroundAudioManager()
		//监视音乐播放/暂停/停止
		this.backgroundAudioManager.onPlay(() => {
			//修改音乐的状态
			this.changePlayState(true)
			// 修改全局音乐播放的状态
			appInstance.globalData.musicId = musicId
		})
		this.backgroundAudioManager.onPause(() => {
			this.changePlayState(false)
		})
		this.backgroundAudioManager.onStop(() => {
			this.changePlayState(false)
		})
		//监听音乐播放自然结束
		this.backgroundAudioManager.onEnded(() => {
			// 自动切换至下一首音乐，并且自动播放
			PubSub.publish('switchType', 'next')
			// 将实时进度条长度还原成0,时间还原为0
			this.setData({
				currentWidth:0,
				currentTime:'00:00'
			})
		})

		//监听音乐实时播放的进度
		this.backgroundAudioManager.onTimeUpdate(() => {
			// console.log('总时长',	this.backgroundAudioManager.duration);
			// console.log('时间',this.backgroundAudioManager.currentTime);
			// 格式化实时的播放时间
			let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
			let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration *450

			this.setData({
				currentTime,
				currentWidth
			})
		})

	},

	//修改播放状态的功能函数
	changePlayState(isPlay) {
		this.setData({
			isPlay
		})

		// 修改全局音乐播放的状态
		appInstance.globalData.isMusicPlay = isPlay
	},

	// 获取歌曲详情
	async getMusicInfo(musicid) {
		let songData = await request('/song/detail', {
			ids: musicid
		})
		// 把毫秒转换成分钟
		let durationTime = moment(songData.songs[0].dt).format('mm:ss')
		this.setData({
			song: songData.songs[0],
			durationTime
		})
		// 动态修改窗口的标题
		wx.setNavigationBarTitle({
			title: this.data.song.name
		})
	},

	// 点击播放/暂停播放 的回调
	handleMusicPlay() {
		let isPlay = !this.data.isPlay
		//修改是否播放的状态
		//  this.setData({
		// 	 isPlay
		//  })

		let {
			musicId,
			musicLink
		} = this.data
		this.musicControl(isPlay, musicId, musicLink)

	},

	// 控制音乐播放/暂停的功能函数
	async musicControl(isPlay, musicId, musicLink) {
		if (isPlay) { // 音乐播放
			if (!musicLink) {
				// 获取音乐的播放链接
				let musicLinkData = await request('/song/url', {
					id: musicId
				})
				musicLink = musicLinkData.data[0].url
				this.setData({
					musicLink
				})
			}

			//给实例添加必要属性
			this.backgroundAudioManager.src = musicLink
			this.backgroundAudioManager.title = this.data.song.name

		} else { //音乐暂停
			this.backgroundAudioManager.pause()
		}
	},

	// 点击切换歌曲的回调
	handleSwitch(event) {
		let type = event.currentTarget.id
		//关闭当前播放的音乐
		this.backgroundAudioManager.stop()
		// 订阅来自recommentdSong 页面发布的musicId消息
		PubSub.subscribe('musicId', (msg, musicId) => {
			//获取音乐的详情信息
			this.getMusicInfo(musicId)
			// 自动播放当前的音乐
			this.musicControl(true, musicId)

			// 取消订阅
			PubSub.unsubscribe('musicId')
		})

		// 发布消息给recommentdSong 页面
		PubSub.publish('switchType', type)

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	}
})