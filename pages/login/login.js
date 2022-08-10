// pages/login/login.js
//#region 
/*
	说明：登入流程
		1.收集表单数据
		2.前端验证
			1>验证用户登入信息是否合法
			2>前端验证不通过就提示用户，不需要发请求
			3>前端验证通过了，发请求带数据给服务器
		3.后端验证
			1>验证用户是否存在
			2>用户不存在直接返回，告诉前端不存在
			3>用户存在需要验证密码是否正确
			4>密码不正确返回提示前端
			5>密码正常返回给前端数据，提示用户登入成功，携带用户的个人信息
*/
//#endregion

import request from '../../utils/request'
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		phone: '18070256604', //手机
		password: 'tonghua.0' //密码
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

	},
	// 表单项内容发生改变
	hanldInput(event) {
		/* 	let type = event.currentTarget.id  //id传值 取值：phone||password
			console.log(event); */
		let type = event.currentTarget.dataset.type // data-key=value

		this.setData({
			[type]: event.detail.value
		})
	},
	//登入的回调
	async login() {
		// 1.手机表单验证
		let {
			phone,
			password
		} = this.data
		//2.前端验证
		/* 
			手机号验证:
				1.内容为空
				2.手机号格式不正确
				3.手机号格式正确，验证通过
		*/
		if (!phone) {
			wx.showToast({
				title: '手机号不能为空',
				icon: 'error'
			})
			return
		}
		let phoneReg = /^1(3|4|5|6|7|8|9)\d{9}$/
		if (!phoneReg.test(phone)) {
			wx.showToast({
				title: '手机号格式不正确',
				icon: 'error'
			})
			return
		}
		if (!password) {
			wx.showToast({
				title: '密码不能为空',
				icon: 'error'
			})
			return
		}
		// 后端验证
		let result = await request('/login/cellphone', {
			phone,
			password,
			isLogin:true
		})
		if (result.code === 200) {
			wx.showToast({
				title: '登入成功',
				icon:'success'
			})
			console.log(result);
			//将用户的信息存储至本地
			wx.setStorageSync('userInfo', JSON.stringify(result.profile))
			// 跳转至个人中心页
			wx.reLaunch({
				url:'/pages/personal/personal'
			})
		} else if (result.code === 400) {
			wx.showToast({
				title: '手机号错误',
				icon: 'error'
			})
		} else if (result.code === 502) {
			wx.showToast({
				title: '密码错误',
				icon: 'error'
			})
		} else {
			wx.showToast({
				title: '登入失败,请重新登入',
				icon:'none'
			})
		}
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