import request from '../../utils/request'
// pages/index/index.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		bannerList: [], //轮播图数据
		songList: [], //推荐歌单
		topList: [] //排行榜数据
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	async onLoad(options) {
		// 发送轮播图请求
		const banners = await request('/banner', {
			type: 2
		})
		// 发送推荐歌单请求
		const songList = await request('/personalized', {
			limit: 20
		})
		//发送排行榜数据请求
		/* 
		 * 需求分析
		 *		1.需要根据idx的值获取对应数据
		 *  	2.idx的取值范围是0-20，我们需要0-4
		 *		3.需要发送5次请求
		 *	前++ 和 后++的区别
		 *		1.先看是运算符还是值
		 *		2.如果看到的是运算符就先运算再赋值
		 * 	3.如果先看到的值那么就先赋值再运算
		 */
		/* let index = 0
		let resultArr =[]
		while(index<5){
			let topListData = await request('/top/list',{idx:index++})
			let topListItem ={
				name:topListData.playlist.name,
				tracks:topListData.playlist.tracks.slice(0,3)
			}
			resultArr.push(topListItem)
			// 不需要等待五次请求成功才更新,用户体验好，费点性能,渲染次数多一些
			this.setData({
				topList:resultArr
			})
		} */
		/* 方案二 */
		let topListData = await request('/toplist/detail')
		let topListItem = topListData.list.splice(0, 4)
		let resultArr = []
		for (const item of topListItem) {
			const resultItem = await request('/playlist/detail', {
				id: item.id
			})
			let resultData = {
				name: resultItem.playlist.name,
				tracks:resultItem.playlist.tracks.slice(0,3)
			}
			resultArr.push(resultData)
		}
		this.setData({
			bannerList: banners.banners, //轮播图
			songList: songList.result, //推荐歌单
			topList: resultArr //排行榜
		})
	},

	// 跳转至recommendSong的回调
	toRecommendSong(){
		wx.navigateTo({
			url: '/songPackage/pages/recommentSong/recommentSong',
		})
	},
	toOther(){
		wx.navigateTo({
			url: '/otherPackage/pages/other/other',
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
	onShareAppMessage() {

	}
})