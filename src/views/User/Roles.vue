<template>
  <section>
    <!--工具条-->
    <!-- <toolbar :buttonList="buttonList" @callFunction="callFunction"></toolbar> -->

    <!--列表-->
    <a-table :data-source="roles" :columns="columns" :rowKey="'Id'" :loading="listLoading"
      :expanded-row-keys.sync="expandedRowKeys" :row-selection="rowSelection" style="width: 100%" ref="table">
      <span slot="AuthorityScope" slot-scope="AuthorityScope">
        <a-tag :color="'red'" v-if="AuthorityScope == -1">无任何数据权限 </a-tag>
        <a-tag v-if="AuthorityScope == 1">自定义数据权限 </a-tag>
        <a-tag v-if="AuthorityScope == 2">本部门数据权限</a-tag>
        <a-tag :color="'orange'" v-if="AuthorityScope == 3">本部门及以下所有部门</a-tag>
        <a-tag v-if="AuthorityScope == 4">仅自己数据权限</a-tag>
        <a-tag :color="'green'" v-if="AuthorityScope == 9">全部数据权限</a-tag>
      </span>
      <span slot="Enabled" slot-scope="Enabled">
        <a-tag :color="Enabled ? 'green' : 'red'" disable-transitions>{{ !Enabled ? "禁用" : "正常"
        }}</a-tag>
      </span>
    </a-table>
  </section>
</template>

<script>
import util from "@/utils/date";
import {
  getRoleListPage,
  removeRole,
  editRole,
  addRole,
  getDepartmentTree,
}
  from "@/api/api";

import { getButtonList } from "@/permission";
import Toolbar from "../../components/Toolbar";

const columns = [
  {
    title: '角色名',
    dataIndex: 'Name',
    key: 'Name',
  },
  {
    title: '权限范围',
    key: 'AuthorityScope',
    dataIndex: 'AuthorityScope',
    scopedSlots: { customRender: 'AuthorityScope' },
  },
  {
    title: '说明',
    dataIndex: 'Description',
    key: 'Description',
  },
  {
    title: '状态',
    key: 'Enabled',
    dataIndex: 'Enabled',
    scopedSlots: { customRender: 'Enabled' },
  },
  {
    title: '创建时间',
    dataIndex: 'CreateTime',
    key: 'CreateTime',
  },
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
        name: "",
      },
      buttonList: [],
      options: [],
      roles: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      statusList: [
        { name: "激活", value: true },
        { name: "禁用", value: false },
      ],
      total: 0,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列
      currentRow: null,
      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        Name: [{ required: true, message: "请输入角色名", trigger: "blur" }],
        Enabled: [{ required: true, message: "请选择状态", trigger: "blur" }],
      },
      //编辑界面数据
      editForm: {
        Id: 0,
        CreateBy: "",
        Name: "",
        Enabled: false,
        AuthorityScope: -1,
        Dids: "",
      },

      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        Name: [{ required: true, message: "请输入角色名", trigger: "blur" }],
        Enabled: [{ required: true, message: "请选择状态", trigger: "blur" }],
      },
      //新增界面数据
      addForm: {
        CreateBy: "",
        CreateId: "",
        Name: "",
        AuthorityScope: -1,
        Dids: "",
        Enabled: true,
      },
      isResouceShow: 0,
    };
  },
  computed: {
    showTags() {
      return this.editForm.Dids ? this.editForm.Dids.split(",") : [];
    },
  },
  methods: {
    handleCheckChangeAdd(data, checked, indeterminate) {
      this.addForm.Dids = this.addForm.Dids.replace(data.value + ",", "");
      if (checked) {
        this.addForm.Dids += data.value + ",";
      }
      console.log(data, checked, indeterminate);
    },
    handleCheckChangeEdit(data, checked, indeterminate) {
      if (this.editForm.Dids) {
        this.editForm.Dids = this.editForm.Dids.replace(data.value + ",", "");
      } else {
        this.editForm.Dids = "";
      }
      if (checked) {
        this.editForm.Dids += data.value + ",";
      }
      console.log(data, checked, indeterminate);
    },
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
      this.getRoles();
    },
    //获取用户列表
    getRoles() {
      let _this = this;
      let para = {
        page: this.page,
        key: this.filters.name,
      };
      this.listLoading = true;
      //NProgress.start();
      getRoleListPage(para).then((res) => {
        this.total = res.data.response.dataCount;
        this.roles = res.data.response.data;
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
          removeRole(para).then((res) => {
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

            this.getRoles();
          });
        })
        .catch(() => { });
    },
    //显示编辑界面
    handleEdit() {
      let row = this.currentRow;
      this.options = [];
      if (!row) {
        this.$message({
          message: "请选择要编辑的一行数据！",
          type: "error",
        });

        return;
      }

      let para = { pid: 0 };
      getDepartmentTree(para).then((res) => {
        ++this.isResouceShow;
        this.options.push(res.data.response);
        setTimeout(() => {
          if (this.$refs.treeEdit) {
            this.$refs.treeEdit.setCheckedKeys(row.Dids.split(","));
          }
        }, 100);
      });

      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    //显示新增界面
    handleAdd() {
      this.addFormVisible = true;
      this.options = [];
      this.addForm = {
        CreateBy: "",
        Name: "",
        Enabled: "",
        AuthorityScope: -1,
        Dids: "",
      };

      let para = { pid: 0 };
      getDepartmentTree(para).then((res) => {
        ++this.isResouceShow;
        this.options.push(res.data.response);
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

            para.birth =
              !para.birth || para.birth == ""
                ? util.formatDate.format(new Date(), "yyyy-MM-dd")
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

            if (this.$refs.treeEdit) {
              let pids = this.$refs.treeEdit.getCheckedKeys();
              para.Dids = pids.join(",");
            }

            editRole(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }

              if (res.data.success) {
                this.editLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["editForm"].resetFields();
                this.editFormVisible = false;
                this.getRoles();
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
            para.birth =
              !para.birth || para.birth == ""
                ? util.formatDate.format(new Date(), "yyyy-MM-dd")
                : util.formatDate.format(new Date(para.birth), "yyyy-MM-dd");

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

            if (this.$refs.treeAdd) {
              let pids = this.$refs.treeAdd.getCheckedKeys();
              para.Dids = pids.join(",");
            }

            addRole(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.addLoading = false;
                return;
              }
              if (res.data.success) {
                this.addLoading = false;
                //NProgress.done();
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["addForm"].resetFields();
                this.addFormVisible = false;
                this.getRoles();
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
    getButtonList2(routers) {
      let _this = this;
      routers.forEach((element) => {
        let path = this.$route.path.toLowerCase();
        if (element.path && element.path.toLowerCase() == path) {
          _this.buttonList = element.children;
          return;
        } else if (element.children) {
          _this.getButtonList(element.children);
        }
      });
    },
  },
  mounted() {
    this.getRoles();

    let routers = window.localStorage.router && window.localStorage.router.length > 20
      ? JSON.parse(window.localStorage.router)
      : [];

    //第二种写法，封装到 permissionRouter.js 中
    // this.buttonList = getButtonList(this.$route.path, routers);
  },
};
</script>

