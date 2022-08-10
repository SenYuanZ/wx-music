// pages/video/video.js
import request from '../../utils/request'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		videoGroupList: [], //导航标签数据
		navId: '', //导航的标识
		videoList: [], //视频的列表数据
		videoId:'', //视频id标识
		videoUpdateTime:[], //记录video播放时长
		isTriggered:false,	//标识下拉刷新是否被触发
		pageIndex:0,	//标识当前页数
		

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		//调用获取导航数据
		this.getVideoGroupListData()
	},

	//获取导航数据
	async getVideoGroupListData() {
		let videoGroupListData = await request('/video/group/list')
		this.setData({
			videoGroupList: videoGroupListData.data.slice(0, 14),
			navId: videoGroupListData.data[0].id
		})
		//调用获取视频列表数据回调
		this.getVideoList(this.data.navId)
	},

	// 获取视频列表数据
	async getVideoList(navId) {
		let index = 0
		let urls = []
		let {
			datas
		} = await request('/video/group', {
			id: navId
		})
		//给video添加个唯一值
		let videoList = datas.map(item => {
			item.id = index++
			return item
		})
		// 循环遍历出每个视频的vid
		for (const key in datas) {
			let vid = datas[key].data.vid
			//根据vid获取到相应视频
			let videoListData = await request('/video/url', {
				id: vid
			})
			//压入到数组中
			urls.push(videoListData)
		}
		//关闭消息提示框
		wx.hideLoading()
		//让视频标签列表数据和视频数据经行合并
		urls.forEach((item, index) => {
			videoList[index].urls = item.urls[0]
		})

		this.setData({
			videoList,
			isTriggered:false //关闭下拉刷新
		})
	},

	// 点击切换导航回调	
	changeNav(event) {
		//let navId = event.currentTarget.id	//通过id问wenvent传参的时候如果传的是number会自动转换成string
		let navId = event.currentTarget.dataset.id //通过data-id传参
		/* 位移运算符 >>> <<<  (navId>>>0)右移零位 会将非number强制转换为number*/
		this.setData({
			navId: navId,
			videoList: []
		})
		//显示正在加载
		wx.showLoading({
			title: '正在加载'
		})
		//动态获取当前导航对应的视频数据
		this.getVideoList(this.data.navId)
	},

	//点击播放/继续播放的回调
	handlePlay(event) {
		/*  问题：多个视频同时播放的问题
				1.在点击播放的事件中需要找到上一个播放的视频
				2.在播放信的视频之前关闭上一个正在播放的视频
		 关键：如果找到上一个视频的实例对象
					如何确认点击播放的视频和正在播放的视频不是同一个视频
			单列模式：
					1.需要创建多个对象的场景下，通过一个变量接收，始终保持只有一个对象
					2.节省内存空间  
		*/

		let vid = event.currentTarget.id
		//关闭上一个视频
		// this.vid !== vid && this.videoContext && this.videoContext.stop()
		// this.vid = vid

		// 更新data中videoId的状态数据
		this.setData({
			videoId:vid
		})

		// 创建控制video标签的实例对象
		this.videoContext = wx.createVideoContext(vid)
		// this.videoContext.stop()
		// 判断当前的视频是否播放过
		let {videoUpdateTime} = this.data
		let videoItem = videoUpdateTime.find(item=>item.vid===vid)
		if(videoItem){
			this.videoContext.seek(videoItem.currentTime)
		}
	},

	// 监听视频播放进度的回调
	handleTimeUpdate(event){
		let videoTimeObj = {vid:event.currentTarget.id,currentTime:event.detail.currentTime}
		let {videoUpdateTime} = this.data
		
		/* 
			思路：判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
				1.如果有，在原有的播放记录中修改播放时间为当前的播放时间
				2.如果没有，需要在数组中添加当前视频的播放对象
		*/
		let videoItem = videoUpdateTime.find(item=>item.vid===videoTimeObj.vid)
		if(videoItem){	//之前有
			videoItem.currentTime = event.detail.currentTime
		}else{	//之前没有
			videoUpdateTime.push(videoTimeObj)
		}
		// 更新videoUpdateTime的状态
		this.setData({
			videoUpdateTime
		})
	},

	// 播放结束的回调
	handleEnded(event){
		let {videoUpdateTime} = this.data
		videoUpdateTime.splice(videoUpdateTime.findIndex((item=>item.id===event.currentTarget.id)),1)
		this.setData({
			videoUpdateTime
		})
	},

	// 自定义下拉刷新的回调：scroll-view
	handleRefresher(){
		console.log('scroll-view');
		//再次发请求，获取最新的列表数据
		this.getVideoList(this.data.navId)
	},

	// 自定义上拉加载的回调
	async handleToLower(){
		console.log('上拉加载');
		// 数据分页：1.后端分页,2.前端分页
		let newVideoList = await request('/video/group',{id:this.data.navId,offset:this.data.pageIndex++})
		let videoList =this.data.videoList
		//将视频最新的数据更新到原有的视频列表数据中
		 videoList.push(...newVideoList.datas)
			this.setData({
				videoList
			})
	},

	// 跳转至搜索界面
	toSearch(){
		wx.navigateTo({
			url: '/pages/search/search',
		})
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
	onShareAppMessage({from}) {
		console.log(from);

	}
})