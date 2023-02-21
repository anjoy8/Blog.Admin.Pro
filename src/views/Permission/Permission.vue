<template>
  <section>
    <!--工具条-->
    <!-- <toolbar :buttonList="buttonList" @callFunction="callFunction"></toolbar> -->

    <!--列表-->
    <a-table :data-source="permissions" :columns="columns" :rowKey="'Id'" :loading="listLoading"
      :expanded-row-keys.sync="expandedRowKeys" :row-selection="rowSelection" style="width: 100%" ref="table">
      <span slot="IsButton" slot-scope="IsButton">
        <a-tag :color="IsButton ? 'green' : 'red'" disable-transitions>{{ !IsButton ? "否" : "是"
        }}</a-tag>
      </span>
      <span slot="IsHide" slot-scope="IsHide">
        <a-tag :color="IsHide ? 'green' : 'red'" disable-transitions>{{ !IsHide ? "否" : "是"
        }}</a-tag>
      </span>
      <span slot="IskeepAlive" slot-scope="IskeepAlive">
        <a-tag :color="IskeepAlive ? 'green' : 'red'" disable-transitions>{{ !IskeepAlive ? "否" : "是"
        }}</a-tag>
      </span>
    </a-table>
    


  </section>
</template>

<script>
import util from "@/utils/date";
import {
  getPermissionListPage,
  getPermissionTreeTable,
  removePermission,
  editPermission,
  addPermission,
  getPermissionTree,
  getModuleListPage,
  migratePermissionTable
} from "@/api/api";
import { getButtonList } from "@/permission";
import Toolbar from "../../components/Toolbar";

const columns = [
  {
    title: '菜单/按钮',
    dataIndex: 'Name',
    key: 'Name',
  },
  {
    title: '路由地址',
    dataIndex: 'Code',
    key: 'Code',
  },
  {
    title: 'API接口',
    dataIndex: 'MName',
    key: 'MName',
  },
  {
    title: '排序',
    dataIndex: 'OrderSort',
    key: 'OrderSort',
  },
  {
    title: '按钮事件',
    dataIndex: 'Func',
    key: 'Func',
  },
  {
    title: '是否按钮',
    key: 'IsButton',
    dataIndex: 'IsButton',
    scopedSlots: { customRender: 'IsButton' },
  },
  {
    title: '是否隐藏',
    key: 'IsHide',
    dataIndex: 'IsHide',
    scopedSlots: { customRender: 'IsHide' },
  },
  {
    title: 'keepAlive',
    key: 'IskeepAlive',
    dataIndex: 'IskeepAlive',
    scopedSlots: { customRender: 'IskeepAlive' },
  },
  // {
  //   title: '创建时间',
  //   dataIndex: 'CreateTime',
  //   key: 'CreateTime',
  // },
];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

export default {
  components: { Toolbar },
  data() {
    return {
      columns,
      rowSelection,
      expandedRowKeys: [],
      selectedRowKeys: [],
      filters: {
        Name: "",
      },
      permissions: [],
      modules: [], //接口api列表
      statusList: [
        { Name: "激活", value: true },
        { Name: "禁用", value: false },
      ],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        Name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
        Code: [{ required: true, message: "请输入路由地址", trigger: "blur" }],
      },
      //编辑界面数据
      editForm: {
        Id: 0,
        Mid: 0,
        OrderSort: 0,
        PidArr: [],
        CreateBy: "",
        Name: "",
        Code: "",
        Description: "",
        Icon: "",
        Func: "",
        Enabled: true,
        IsButton: false,
        IsHide: false,
        IskeepAlive: false,
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addCodeDisabled: false,
      editCodeDisabled: false,
      syncFormVisible: false,
      addFormRules: {
        Name: [{ required: true, message: "请输入菜单名称", trigger: "blur" }],
        Code: [{ required: true, message: "请输入路由地址", trigger: "blur" }],
      },
      //新增界面数据
      addForm: {
        CreateBy: "",
        CreateId: "",
        PidArr: [],
        Mid: 0,
        OrderSort: 0,
        Name: "",
        Code: "",
        Description: "",
        Icon: "",
        Func: "",
        Enabled: true,
        IsButton: false,
        IsHide: false,
        IskeepAlive: false,
      },
      isResouceShow: 0,
    };
  },
  methods: {
    dialogCheck(selection, row) {
      this.currentRow = null;
      this.$refs.table.clearSelection();
      if (selection.length === 0) {
        return;
      }
      if (row) {
        this.selectCurrentRow(row);
      }
    },
    selectCurrentRow(val) {
      if (val) {
        this.currentRow = val;
        this.$refs.table.clearSelection();
        this.$refs.table.toggleRowSelection(val, true);
      }
    },
    clkType() {
      this.addForm.IsButton = false;
      this.addCodeDisabled = false;
      if (this.addForm.MenuType == "页面") {
        this.addForm.Code = "";
      } else if (this.addForm.MenuType == "目录") {
        this.addForm.Code = "-";
        this.addCodeDisabled = true;
      } else if (this.addForm.MenuType == "按钮") {
        this.addForm.Code = " ";
        this.addForm.IsButton = true;
        this.addCodeDisabled = true;
      }
    },
    clkTypeEdit() {
      this.editForm.IsButton = false;
      this.editCodeDisabled = false;
      if (this.editForm.MenuType == "页面") {
        this.editForm.Code = "";
      } else if (this.editForm.MenuType == "目录") {
        this.editForm.Code = "-";
        this.editCodeDisabled = true;
      } else if (this.editForm.MenuType == "按钮") {
        this.editForm.Code = " ";
        this.editForm.IsButton = true;
        this.editCodeDisabled = true;
      }
    },
    callFunction(item) {
      this.filters = {
        name: item.search,
      };
      this[item.Func].apply(this, item);
    },
    //性别显示转换
    formatEnabled: function (row, column) {
      return row.Enabled ? "正常" : "未知";
    },
    formatCreateTime: function (row, column) {
      return !row.CreateTime || row.CreateTime == ""
        ? ""
        : util.formatDate.format(new Date(row.CreateTime), "yyyy-MM-dd");
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getPermissions();
    },
    load(tree, treeNode, resolve) {
      let para = {
        page: this.page,
        f: tree.Id,
        key: this.filters.Name,
      };
      getPermissionTreeTable(para).then((res) => {
        resolve(res.data.response);
      });
    },
    //获取用户列表
    getPermissions() {
      let para = {
        page: this.page,
        pageSize: 9999,
        key: this.filters.name,
      };
      this.listLoading = true;

      //NProgress.start();
      getPermissionListPage(para).then((res) => {
        this.permissions = res.data.response.data;
        this.listLoading = false;
        //NProgress.done();
      });
    },
    //删除
    handleDel() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要删除的一行数据！",
          type: "error",
        });

        return;
      }
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning",
      })
        .then(() => {
          this.listLoading = true;
          //NProgress.start();
          let para = { id: row.Id };
          removePermission(para).then((res) => {
            if (util.isEmt.format(res)) {
              this.listLoading = false;
              return;
            }
            this.listLoading = false;
            //NProgress.done();
            if (res.data.success) {
              this.$message({
                message: "删除成功",
                type: "success",
              });
            } else {
              this.$message({
                message: res.data.msg,
                type: "error",
              });
            }

            this.getPermissions();
          });
        })
        .catch(() => { });
    },
    //显示编辑界面
    handleEdit() {
      let row = this.currentRow;
      if (!row) {
        this.$message({
          message: "请选择要编辑的一行数据！",
          type: "error",
        });

        return;
      }
      let that = this;

      that.options = [];

      this.editForm = {};
      that.editLoading = true;
      that.editFormVisible = true;
      that.editCodeDisabled = false;
      let para = { pid: row.Id };
      getPermissionTree(para).then((res) => {
        ++that.isResouceShow;
        this.options.push(res.data.response);
        that.editForm = Object.assign({}, row);
        that.editLoading = false;
      });
    },
    //显示同步界面
    handleSync(isAction = false) {
      let row = this.currentRow;
      var pid = row && row.Id;
      if (!(pid > 0)) {
        this.$message({
          message: "请选择要同步的父级页面！",
          type: "error",
        });

        return;
      }

      var controllerName = row && row.MName && row.MName.split('/')[2] || '';
      if (!controllerName) {
        this.$message({
          message: "要同步的接口控制器名不能为空！",
          type: "error",
        });

        return;
      }

      let that = this;

      that.syncoptions = [];

      that.syncFormVisible = true;
      let para = { controllerName, pid, isAction };
      migratePermissionTable(para).then((res) => {
        that.syncoptions = res.data.response;
      });
    },
    //显示新增界面
    handleAdd() {
      this.options = [];
      this.addFormVisible = true;
      this.addCodeDisabled = false;
      this.addLoading = true;
      this.addForm = {
        CreateBy: "",
        CreateId: "",
        PidArr: [],
        Name: "",
        Code: "",
        OrderSort: 0,
        Description: "",
        Enabled: true,
        Icon: "",
        IsButton: false,
        IsHide: false,
        IskeepAlive: false,
      };

      let para = { pid: 0 };
      getPermissionTree(para).then((res) => {
        ++this.isResouceShow;
        this.options.push(res.data.response);
        this.addLoading = false;
      });
    },
    //编辑
    editSubmit: function () {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.editLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.editForm);

            para.ModifyTime = util.formatDate.format(new Date(), "yyyy-MM-dd");

            para.Pid = para.PidArr.pop();

            if (para.Id == para.Pid) {
              this.$message({
                message: "警告，父节点不能是自己！",
                type: "error",
              });

              this.editLoading = false;
              return;
            }

            editPermission(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }
              this.editLoading = false;
              if (res.data.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["editForm"].resetFields();
                this.$refs.table.setCurrentRow();
                this.editFormVisible = false;
                this.getPermissions();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "error",
                });
              }
            });
          });
        }
      });
    },
    //新增
    addSubmit: function () {
      let _this = this;
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {}).then(() => {
            this.addLoading = true;
            //NProgress.start();
            let para = Object.assign({}, this.addForm);

            para.CreateTime = util.formatDate.format(new Date(), "yyyy-MM-dd");
            para.ModifyTime = para.CreateTime;
            para.IsDeleted = false;

            para.Pid = para.PidArr.pop();

            var user = JSON.parse(window.localStorage.user);

            if (user && user.uID > 0) {
              para.CreateId = user.uID;
              para.CreateBy = user.uRealName;
            } else {
              this.$message({
                message: "用户信息为空，先登录",
                type: "error",
              });
              _this.$router.replace(
                _this.$route.query.redirect ? _this.$route.query.redirect : "/"
              );
            }

            addPermission(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.addLoading = false;
                return;
              }
              this.addLoading = false;
              if (res.data.success) {
                this.addLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["addForm"].resetFields();
                this.options = [];
                this.$refs.table.setCurrentRow();
                this.addFormVisible = false;
                this.getPermissions();
              } else {
                this.$message({
                  message: res.data.msg,
                  type: "error",
                });
              }
            });
          });
        }
      });
    },
  },
  mounted() {
    this.getPermissions();

    getModuleListPage({ page: -1 }).then((res) => {
      this.modules = res.data.response.data;
    });


    let routers = window.localStorage.router && window.localStorage.router.length > 20
      ? JSON.parse(window.localStorage.router)
      : [];
    // this.buttonList = getButtonList(this.$route.path, routers);
  },
};
</script>

<style scoped>
.custom-tbl /deep/ .has-gutter .el-checkbox {
  display: none;
}
</style>
