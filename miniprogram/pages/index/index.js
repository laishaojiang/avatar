//index.js
let index = 0,
  items = [],
  flag = true,
  itemId = 1;
const hCw = 1; // 图片宽高比
const canvasPre = 1; // 展示的canvas占mask的百分比
const maskCanvas = wx.createCanvasContext('maskCanvas');

const app = getApp()

Page({
  data: {
    // avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',

    ratio: 102 / 152,
    avatarUrl: '',
    chooseImgUrl: '/images/aripod1.png',
    marginLeft: 0,
    marginTop: 0,
    imgHeight: 100,
    imgWidth: 100,
    tabs: [{
        name: '耳机',
        orderStatus: 0
      },
      {
        name: '帽子',
        orderStatus: 1
      },
      {
        name: '国旗',
        orderStatus: 2
      },
      {
        name: '其他',
        orderStatus: 3
      }
    ],
    curIndex: 0,
    
    curSelect0: 0,
    curSelect1: 0,
    curSelect2: 0,
    curSelect3: 0,
    imgbox0: [
      '/images/aripods/1.png',
      '/images/aripods/2.png', 
      '/images/aripods/3.png', 
      '/images/aripods/4.png',
      '/images/aripods/5.png'
    ],
    imgbox1: [
      // '/images/caps/1.png',
      // '/images/caps/2.png', 
      '/images/caps/3.png', 
      '/images/caps/4.png',
      '/images/caps/5.png',
      '/images/caps/6.png',
      '/images/caps/7.png', 
      '/images/caps/8.png', 
      '/images/caps/9.png',
      '/images/caps/10.png',
      '/images/caps/11.png'
    ],
    imgbox2: [
      '/images/flag/1.png',
    ],
    imgbox3: [
      '/images/mask/1.png',
      '/images/mask/2.png', 
      '/images/mask/3.png', 
      '/images/mask/4.png',
      '/images/mask/5.png',
      '/images/mask/6.png',
      '/images/mask/7.png', 
      '/images/mask/8.png', 
      '/images/mask/9.png',
      '/images/mask/10.png',
      '/images/mask/11.png',
      '/images/mask/12.png', 
      '/images/mask/13.png', 
      '/images/mask/14.png',
      '/images/mask/15.png',
      '/images/mask/16.png',
      '/images/mask/17.png', 
      '/images/mask/18.png', 
      '/images/mask/19.png',
      '/images/mask/20.png',
      '/images/mask/21.png',
      '/images/mask/22.png',
      '/images/mask/23.png', 
      '/images/mask/24.png',
      '/images/mask/25.png',
      '/images/mask/26.png',
      '/images/mask/27.png',
    ],
    
    showTips: false,

    itemList: [],
    canvasWidth: 250,
    canvasHeight: 250
  },

  onLoad: function() {
    items = this.data.itemList;
    this.drawTime = 0
    // this.setDropItem({
    //   url: this.data.avatarUrl
    // });
    // wx.getSystemInfo({
    //   success: sysData => {
    //     this.sysData = sysData
    //     this.setData({
    //       canvasWidth: this.sysData.windowWidth * canvasPre, // 如果觉得不清晰的话，可以把所有组件、宽高放大一倍
    //       canvasHeight: this.sysData.windowWidth * canvasPre * hCw,
    //     })
    //   }
    // })

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: async (res) => {
              const avatarUrl = await this.getImageInfo(res.userInfo.avatarUrl)
              this.setData({
                avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        } else {
          this.setData({
            avatarUrl: '/images/logo.png'
          })
        }
      }
    })
  },
  catchtouchstart(e) {
  },
  tabClick(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      curIndex: index
    })
  },

  selectImg(e) {
    const { img, index } = e.currentTarget.dataset
    this.setData({
      chooseImage: img,
      [`curSelect${this.data.curIndex}`]: index
    })
    this.setDropItem({
      url: img
    });
    // this.chooseImgUrl = img
    // this[`curSelect${this.curIndex}`] = index
  },

  onGetUserInfo: async function(e) {
    console.log(e)
    if (!this.data.logged && e.detail.userInfo) {
      const avatarUrl = await this.getImageInfo(e.detail.userInfo.avatarUrl)
      this.setData({
        logged: true,
        avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  async saveImage() {
    const res = await this.drawImg()
    wx.saveImageToPhotosAlbum({
      filePath: res,
      success: function() {
        console.log('save success');
        wx.showToast({
          title:'保存成功'
        })
      },
      fail: (err) => {
        console.log(err)
        this.showTips = true
      }
    });
  },

  drawImg() {

  },

  // 上传图片
  chooseImage: function () {
    // 选择图片
    let _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '图片加载中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: async (res) => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            wx.showLoading({
              title: '图片安全检测中',
            })
            debugger
            const result = await wx.cloud.callFunction({
              name: 'imgCheck',
              data: {
                fileID: res.fileID
              }
            })
            console.log(result)
            if(result.result.errorCode == '87014') {
              wx.showToast({
                icon: 'none',
                title: '图片不合格'
              })
            } else {
              _this.setData({
                avatarUrl: filePath
              })
            }
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '图片加载失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

  openSetting(e) {
    console.log(e)
    if(e.detail.authSetting['scope.writePhotosAlbum']) {
      this.setData({
        showToast: false
      })
      this.saveImg()
    }
  },
  //***** */
  setDropItem(imgData) {
    let data = {}
    wx.getImageInfo({
      src: imgData.url,
      success: res => {
        // 初始化数据
        data.width = res.width; //宽度
        data.height = res.height; //高度
        data.image = imgData.url; //地址
        data.id = ++itemId; //id
        data.top = 0; //top定位
        data.left = 0; //left定位
        //圆心坐标
        data.x = data.left + data.width / 2;
        data.y = data.top + data.height / 2;
        data.scale = 1; //scale缩放
        data.oScale = 1; //方向缩放
        data.rotate = 1; //旋转角度
        data.active = false; //选中状态
        console.log(data)
        // items[items.length] = data; 不需要多个
        items = [data]
        this.setData({
          itemList: items
        })
      }
    })
  },
  WraptouchStart: function(e) {
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        index = i;
        items[index].active = true;
      }
    }
    this.setData({
      itemList: items
    })

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;

    console.log(items[index])
  },
  WraptouchMove(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    // console.log('WraptouchMove', e)
    items[index]._lx = e.touches[0].clientX;
    items[index]._ly = e.touches[0].clientY;

    items[index].left += items[index]._lx - items[index].lx;
    items[index].top += items[index]._ly - items[index].ly;
    items[index].x += items[index]._lx - items[index].lx;
    items[index].y += items[index]._ly - items[index].ly;

    items[index].lx = e.touches[0].clientX;
    items[index].ly = e.touches[0].clientY;
    this.setData({
      itemList: items
    })
  },
  WraptouchEnd() {
    this.synthesis()
  },
  oTouchStart(e) {
    //找到点击的那个图片对象，并记录
    for (let i = 0; i < items.length; i++) {
      items[i].active = false;
      if (e.currentTarget.dataset.id == items[i].id) {
        console.log('e.currentTarget.dataset.id', e.currentTarget.dataset.id)
        index = i;
        items[index].active = true;
      }
    }
    //获取作为移动前角度的坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    //移动前的角度
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)
    //获取图片半径
    items[index].r = this.getDistancs(items[index].x, items[index].y, items[index].left, items[index].top);
    console.log(items[index])
  },
  oTouchMove: function(e) {
    if (flag) {
      flag = false;
      setTimeout(() => {
        flag = true;
      }, 100)
    }
    //记录移动后的位置
    items[index]._tx = e.touches[0].clientX;
    items[index]._ty = e.touches[0].clientY;
    //移动的点到圆心的距离
    items[index].disPtoO = this.getDistancs(items[index].x, items[index].y, items[index]._tx, items[index]._ty - 10)

    items[index].scale = items[index].disPtoO / items[index].r;
    items[index].oScale = 1 / items[index].scale;

    //移动后位置的角度
    items[index].angleNext = this.countDeg(items[index].x, items[index].y, items[index]._tx, items[index]._ty)
    //角度差
    items[index].new_rotate = items[index].angleNext - items[index].anglePre;

    //叠加的角度差
    items[index].rotate += items[index].new_rotate;
    items[index].angle = items[index].rotate; //赋值

    //用过移动后的坐标赋值为移动前坐标
    items[index].tx = e.touches[0].clientX;
    items[index].ty = e.touches[0].clientY;
    items[index].anglePre = this.countDeg(items[index].x, items[index].y, items[index].tx, items[index].ty)

    //赋值setData渲染
    this.setData({
      itemList: items
    })

  },
  getDistancs(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    return Math.sqrt(
      ox * ox + oy * oy
    );
  },
  /*
   *参数1和2为图片圆心坐标
   *参数3和4为手点击的坐标
   *返回值为手点击的坐标到圆心的角度
   */
  countDeg: function(cx, cy, pointer_x, pointer_y) {
    var ox = pointer_x - cx;
    var oy = pointer_y - cy;
    var to = Math.abs(ox / oy);
    var angle = Math.atan(to) / (2 * Math.PI) * 360;
    // console.log("ox.oy:", ox, oy)
    if (ox < 0 && oy < 0) //相对在左上角，第四象限，js中坐标系是从左上角开始的，这里的象限是正常坐标系  
    {
      angle = -angle;
    } else if (ox <= 0 && oy >= 0) //左下角,3象限  
    {
      angle = -(180 - angle)
    } else if (ox > 0 && oy < 0) //右上角，1象限  
    {
      angle = angle;
    } else if (ox > 0 && oy > 0) //右下角，2象限  
    {
      angle = 180 - angle;
    }
    return angle;
  },
  deleteItem: function(e) {
    let newList = [];
    for (let i = 0; i < items.length; i++) {
      if (e.currentTarget.dataset.id != items[i].id) {
        newList.push(items[i])
      }
    }
    if (newList.length > 0) {
      newList[newList.length - 1].active = true;
    }
    items = newList;
    this.setData({
      itemList: items
    })
  },
  openMask () {
    if (this.drawTime == 0) {
      this.synthesis()
    }
    this.setData({
      showCanvas: true
    })
  },
  getImageInfo(img) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: img,
        success:(res) => {
          console.log(res);
          resolve(res.path)
        },
        fail(err) {
          console.log(err)
          reject(err)
        }
      });
    })
    
  },
  async synthesis(cb) { // 合成图片
    this.drawTime = this.drawTime + 1
    console.log('合成图片')
    maskCanvas.save();
    maskCanvas.beginPath();
    //一张白图  可以不画
    // maskCanvas.setFillStyle('#fff');
    // maskCanvas.fillRect(0, 0, this.sysData.windowWidth, this.data.canvasHeight)
    // maskCanvas.closePath();
    // maskCanvas.stroke();

    // await new Promise((resolve, reject) => {
    //   console.log(this.data.avatarUrl)
    //   wx.getImageInfo({
    //     src: this.data.avatarUrl,
    //     success:(img) => {
    //       console.log(img);
    //       maskCanvas.drawImage('/images/logo.png', 0,0,this.data.canvasWidth, this.data.canvasWidth)
    //       // maskCanvas.drawImage(img.path, 0,0,250, 250)
    //       maskCanvas.draw(true)
    //       resolve()
    //     },
    //     fail(err) {
    //       console.log(err)
    //       reject(err)
    //     }
    //   });
    // })
    maskCanvas.drawImage(this.data.avatarUrl, 0,0,250, 250)
    //画背景 hCw 为 1.62 背景图的高宽比
    // maskCanvas.drawImage('/images/bg.png', 0, 0, this.data.canvasWidth, this.data.canvasHeight);
    /*
        num为canvas内背景图占canvas的百分比，若全背景num =1
        prop值为canvas内背景的宽度与可移动区域的宽度的比，如一致，则prop =1;
       */
    //画组件
    const num = 1,
      prop = 1;
    items.forEach((currentValue, index) => {
      maskCanvas.save();
      maskCanvas.translate(this.data.canvasWidth * (1 - num) / 2, 0);
      maskCanvas.beginPath();
      maskCanvas.translate(currentValue.x * prop, currentValue.y * prop); //圆心坐标
      maskCanvas.rotate(currentValue.angle * Math.PI / 180);
      maskCanvas.translate(-(currentValue.width * currentValue.scale * prop / 2), -(currentValue.height * currentValue.scale * prop / 2))
      maskCanvas.drawImage(currentValue.image, 0, 0, currentValue.width * currentValue.scale * prop, currentValue.height * currentValue.scale * prop);
      maskCanvas.restore();
    })
    setTimeout(() => {
      maskCanvas.draw(false, (e) => {
        wx.canvasToTempFilePath({
          canvasId: 'maskCanvas',
          x: 0,
          y: 0,
          width: 250,
          height: 250,
          destWidth: 250,
          destHeight: 250,
          success: res => {
            console.log('draw success')
            console.log(res.tempFilePath)
            this.setData({
              canvasTemImg: res.tempFilePath
            }, () => {
              typeof cb === 'function' && cb()
            })
          },
          fail(err) {
            console.log(err)
          }
        }, this)
      })
    }, 300)

  },
  disappearCanvas() {
    this.setData({
      showCanvas: false
    })
  },
  saveBtn: function() {
    if (this.drawTime == 0) { // 未操作图片直接保存
      this.synthesis(() => {
        this.saveImg()
      })
    } else {
      this.saveImg()
    }
    
  },
  saveImg() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.canvasTemImg,
      success: res => {
        wx.showToast({
          title: '保存成功',
          icon: "success"
        })
      },
      fail: res => {
        console.log(res)
        this.setData({
          showTips: true
        })
      }
    })
  }
})
