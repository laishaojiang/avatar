// components/confirm/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    model: Boolean,
    layer: {
      type: Number,
      value: 10
    },
    title: {
      type: String,
      value: "提示"
    },
    cancelText: {
      type: String,
      value: "取消"
    },
    confirmText: {
      type: String,
      value: "确定"
    },
    haveCancel: {
      type: Boolean,
      value: true
    },
    cancelStyle: String,
    confirmStyle: String,
    contentStyle: {
      type: String,
      value: ''
    },
    btnType:{
      type: String,
      value: ''
    },
    confirmMetas: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    outer: false,
    inner: false,
    change: false
  },
  observers: {
    model: function (val) {
      if (val == this.data.change) return
      this.setData({
        change: val
      })
      val ? this.show() : this.hide()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    show() {
      this.setData({
        outer: true
      }, function () {
        this.triggerEvent("show")
        setTimeout(() => {
          this.setData({
            inner: true,
            change: true
          })
        }, 10)
      }.bind(this))
    },
    hide() {
      this.setData({
        inner: false,

      }, function () {
        setTimeout(() => {
          this.setData({
            outer: false,
            change: false
          })
        }, 200)
      }.bind(this))
    },
    confirm() {
      this.triggerEvent("confirm", {
        hide: this.hide.bind(this)
      })
    },
    cancel() {
      this.triggerEvent("cancel")
      this.hide()
    },
    opensetting(e) {
      this.triggerEvent('opensetting', e.detail)
    }
  }
})
