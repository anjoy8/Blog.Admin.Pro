<template>
  <section>
    <!--工具条-->
    <!-- <toolbar :buttonList="buttonList" @callFunction="callFunction"></toolbar> -->

    <!--列表-->
    <a-table :data-source="users" :columns="columns" :rowKey="'Id'" :loading="listLoading"
      :expanded-row-keys.sync="expandedRowKeys" :row-selection="rowSelection" style="width: 100%" ref="table">
      <span slot="RoleNames" slot-scope="RoleNames">
        <a-tag v-for="tag in RoleNames" :key="tag">
          {{ tag.toUpperCase() }}
        </a-tag>
      </span>
      <span slot="uStatus" slot-scope="uStatus">
        <a-tag :color="uStatus ? 'green' : 'red'" disable-transitions>{{ !uStatus ? "禁用" : "正常"
        }}</a-tag>
      </span>
    </a-table>


  </section>
</template>

<script>
import util from "@/utils/date";
import {
  testapi,
  getUserListPage,
  getRoleListPage,
  removeUser,
  batchRemoveUser,
  editUser,
  addUser,
  getDepartmentTree,
}
  from "@/api/api";
import { getButtonList } from "@/permission";
import Toolbar from "../../components/Toolbar";

const columns = [
  {
    title: '名称',
    dataIndex: 'uRealName',
    key: 'uRealName',
  },
  {
    title: '登录名',
    dataIndex: 'uLoginName',
    key: 'uLoginName',
  },
  {
    title: '角色',
    key: 'RoleNames',
    dataIndex: 'RoleNames',
    scopedSlots: { customRender: 'RoleNames' },
  },
  {
    title: '所属部门',
    dataIndex: 'DepartmentName',
    key: 'DepartmentName',
  },
  {
    title: '性别',
    dataIndex: 'sex',
    key: 'sex',
  },
  {
    title: '生日',
    dataIndex: 'birth',
    key: 'birth',
  },
  {
    title: '状态',
    key: 'uStatus',
    dataIndex: 'uStatus',
    scopedSlots: { customRender: 'uStatus' },
  },
  {
    title: '创建时间',
    dataIndex: 'uCreateTime',
    key: 'uCreateTime',
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
      users: [],
      roles: [],
      options: [],
      total: 0,
      buttonList: [],
      currentRow: null,
      page: 1,
      listLoading: false,
      sels: [], //列表选中列

      addDialogFormVisible: false,
      editFormVisible: false, //编辑界面是否显示
      editLoading: false,
      editFormRules: {
        uLoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" },
        ],
        uRealName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        birth: [{ required: true, message: "请填写生日", trigger: "blur" }],
      },
      //编辑界面数据
      editForm: {
        id: 0,
        uID: 0,
        RIDs: 0,
        uLoginName: "",
        uRealName: "",
        name: "",
        sex: -1,
        age: 0,
        birth: "",
        addr: "",
        Dids: [],
        DepartmentId: 0,
      },

      isResouceShow: 0,
      addFormVisible: false, //新增界面是否显示
      addLoading: false,
      addFormRules: {
        uLoginName: [
          { required: true, message: "请输入登录名", trigger: "blur" },
        ],
        uRealName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
        uLoginPWD: [{ required: true, message: "请输入密码", trigger: "blur" }],
        birth: [{ required: true, message: "请填写生日", trigger: "blur" }],
      },
      //新增界面数据
      addForm: {
        name: "",
        uLoginName: "",
        uRealName: "",
        uLoginPWD: "",
        sex: -1,
        age: 0,
        birth: "",
        Dids: [],
        DepartmentId: 0,
        addr: "",
      },
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
    callFunction(item) {
      this.filters = {
        name: item.search,
      };
      this[item.Func].apply(this, item);
    },
    //性别显示转换
    formatSex: function (row, column) {
      return row.sex == 1 ? "男" : row.sex == 0 ? "女" : "未知";
    },
    formatBirth: function (row, column) {
      return !row.birth || row.birth == ""
        ? ""
        : util.formatDate.format(new Date(row.birth), "yyyy-MM-dd");
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getUsers();
    },
    //获取用户列表
    getUsers() {
      let para = {
        page: this.page,
        key: this.filters.name,
      };
      this.listLoading = true;

      testapi();
      //NProgress.start();
      getUserListPage(para).then((res) => {
        this.total = res.data.response.dataCount;
        this.users = res.data.response.data;
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
          let para = { id: row.uID };
          removeUser(para).then((res) => {
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

            this.getUsers();
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
      this.editFormVisible = true;
      this.editForm = Object.assign({}, row);

      getRoleListPage().then((res) => {
        this.roles = res.data.response.data;
      });

      let para = { pid: 0 };
      getDepartmentTree(para).then((res) => {
        ++this.isResouceShow;
        this.options.push(res.data.response);
      });
    },
    //显示新增界面
    handleAdd() {
      this.addFormVisible = true;
      this.options = [];
      this.addForm = {
        uLoginName: "",
        uRealName: "",
        uLoginPWD: "",
        name: "",
        sex: -1,
        age: 0,
        Dids: [],
        DepartmentId: 0,
        birth: "",
        addr: "",
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

            para.DepartmentId = para.Dids.pop();
            editUser(para).then((res) => {
              if (util.isEmt.format(res)) {
                this.editLoading = false;
                return;
              }
              if (res.data.success) {
                this.editLoading = false;
                this.$message({
                  message: res.data.msg,
                  type: "success",
                });
                this.$refs["editForm"].resetFields();
                this.options = [];
                this.editFormVisible = false;
                this.getUsers();
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

            para.DepartmentId = para.Dids.pop();
            addUser(para).then((res) => {
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
                this.options = [];
                this.addFormVisible = false;
                this.getUsers();
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
    this.getUsers();

    let routers = window.localStorage.router && window.localStorage.router.length > 20
      ? JSON.parse(window.localStorage.router)
      : [];
    // this.buttonList = getButtonList(this.$route.path, routers);
  },
};
</script>
 
