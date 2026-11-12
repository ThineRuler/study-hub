// ignore_for_file: prefer_interpolation_to_compose_strings

import 'package:flutter/material.dart';

import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:table_calendar/table_calendar.dart';

//Global variables for cross-page states
String displayName = "";
String userID = "";

String token = "";

//User preference settings
String theme = "dark";
double importanceWeight = 0;
double dueDateWeight = 0;
double timeWeight = 0;

class User {
  String id = "";
  String name = "";
  String email = "";
  bool isVerified = true;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.isVerified,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final data = Map<String, dynamic>.from(json['data'] as Map);
    final userInfo = Map<String, dynamic>.from(data['user'] as Map);

    token = data['token'] as String;
    userID = (userInfo['_id'] ?? userInfo['id']) as String;
    return User(
      id: userID,
      name: displayName,
      email: userInfo['email'] as String? ?? '',
      isVerified: userInfo['isVerified'] as bool? ?? false,
    );
  }
}

Map<String, String> _apiHeaders({bool authenticated = false}) {
  return <String, String>{
    'Content-Type': 'application/json; charset=UTF-8',
    if (authenticated && token.isNotEmpty) 'Authorization': 'Bearer $token',
  };
}

class LoginAPI {
  final String baseUrl = 'http://64.225.121.181';

  Future<User?> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/sign-in'),
      headers: _apiHeaders(),
      body: jsonEncode(<String, String>{'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      return User.fromJson(
        Map<String, dynamic>.from(json.decode(response.body) as Map),
      );
    } else {
      return null;
    }
  }

  Future<int> register(
    String displayName,
    String email,
    String password,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/sign-up'),
      headers: _apiHeaders(),
      body: jsonEncode(<String, String>{
        'name': displayName,
        'email': email,
        'password': password,
      }),
    );

    if (response.statusCode == 201) {
      return 201;
    } else {
      return 1;
    }
  }

  Future<int> forgotPassword(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/forgot-password'),
      headers: _apiHeaders(),
      body: jsonEncode(<String, String>{'email': email}),
    );

    if (response.statusCode == 200) {
      return 200;
    } else {
      return 1;
    }
  }
}

class TaskAPI {
  final String baseUrl = 'http://64.225.121.181';

  Future<List<Task>> getTasks({
    bool? completed,
    String? groupId,
    String? parentTaskId,
    String? from,
    String? to,
  }) async {
    final queryParameters = <String, String>{
      if (completed != null) 'completed': completed.toString(),
      if (groupId != null && groupId.isNotEmpty) 'groupId': groupId,
      if (parentTaskId != null && parentTaskId.isNotEmpty)
        'parentTaskId': parentTaskId,
      if (from != null && from.isNotEmpty) 'from': from,
      if (to != null && to.isNotEmpty) 'to': to,
    };
    final response = await http.get(
      Uri.parse('$baseUrl/api/tasks').replace(
        queryParameters: queryParameters.isEmpty ? null : queryParameters,
      ),
      headers: _apiHeaders(authenticated: true),
    );

    if (response.statusCode == 200) {
      final data = json.decode(response.body) as List;
      return data.map((item) => Task.fromJson(item)).toList();
    } else {
      return [];
    }
  }

  Future<Task?> getTaskById(String id) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/tasks/${Uri.encodeComponent(id)}'),
      headers: _apiHeaders(authenticated: true),
    );

    if (response.statusCode == 200) {
      return Task.fromJson(
        Map<String, dynamic>.from(json.decode(response.body) as Map),
      );
    } else {
      return null;
    }
  }

  Future<int> createTask(
    String name,
    double importance,
    int estPomodoros,
    String? description,
    String? groupId,
    String? dueDate,
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/tasks'),
      headers: _apiHeaders(authenticated: true),
      body: jsonEncode(<String, dynamic>{
        'name': name,
        'description': description,
        'groupId': groupId,
        'importance': importance,
        'estPomodoros': estPomodoros,
        'dueDate': dueDate,
      }),
    );

    if (response.statusCode == 201) {
      return 201;
    } else {
      return 1;
    }
  }

  Future<int> deleteTask(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/tasks/${Uri.encodeComponent(id)}'),
      headers: _apiHeaders(authenticated: true),
    );

    if (response.statusCode == 204) {
      return 204;
    } else {
      return 1;
    }
  }

  Future<Task?> patchTask(
    String id,
    String name,
    String description,
    String groupId,
    double importance,
    int estPomodoros,
    String dueDate,
    bool completed,
    int sortOrder,
  ) async {
    final response = await http.patch(
      Uri.parse('$baseUrl/api/tasks/${Uri.encodeComponent(id)}'),
      headers: _apiHeaders(authenticated: true),
      body: jsonEncode(<String, dynamic>{
        'name': name,
        'description': description,
        'groupId': groupId,
        'importance': importance,
        'estPomodoros': estPomodoros,
        'dueDate': dueDate,
        'completed': completed,
        'sortOrder': sortOrder,
      }),
    );

    if (response.statusCode == 200) {
      return Task.fromJson(json.decode(response.body));
    } else {
      return null;
    }
  }

  Future<int> createGroup(String name, String color) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/groups'),
      headers: _apiHeaders(authenticated: true),
      body: jsonEncode(<String, dynamic>{'name': name, 'color': color}),
    );

    if (response.statusCode == 201) {
      return 201;
    } else {
      return 1;
    }
  }

  Future<List<Group>> getGroups() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/groups'),
      headers: _apiHeaders(authenticated: true),
    );
    if (response.statusCode == 200) {
      final data = json.decode(response.body) as List;
      return data
          .map((item) => Group.fromJson(Map<String, dynamic>.from(item as Map)))
          .toList();
    }
    return [];
  }

  Future<Group?> patchGroup(
    String id, {
    String? name,
    String? color,
    int? sortOrder,
  }) async {
    final body = <String, dynamic>{
      'name': ?name,
      'color': ?color,
      'sortOrder': ?sortOrder,
    };
    final response = await http.patch(
      Uri.parse('$baseUrl/api/groups/${Uri.encodeComponent(id)}'),
      headers: _apiHeaders(authenticated: true),
      body: jsonEncode(body),
    );
    if (response.statusCode == 200) {
      return Group.fromJson(
        Map<String, dynamic>.from(json.decode(response.body) as Map),
      );
    }
    return null;
  }

  Future<int> deleteGroup(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/api/groups/${Uri.encodeComponent(id)}'),
      headers: _apiHeaders(authenticated: true),
    );
    return response.statusCode == 204 ? 204 : 1;
  }
}

class OptionAPI {
  final String baseUrl = 'http://64.225.121.181';

  Future<int> getCurrentUser() async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/users/me'),
      headers: _apiHeaders(authenticated: true),
    );
    if (response.statusCode == 200) {
      return 200;
    } else {
      return 1;
    }
  }

  Future<int> patchCurrentUser(
    String displayName,
    String theme,
    double importanceWeight,
    double dueDateWeight,
    double timeWeight,
  ) async {
    final weights = <String, double>{
      'importance': importanceWeight,
      'dueDate': dueDateWeight,
      'time': timeWeight,
    };
    final settings = <String, dynamic>{
      'theme': theme,
      if (weights.isNotEmpty) 'weights': weights,
    };
    final body = <String, dynamic>{
      'displayName': displayName,
      if (settings.isNotEmpty) 'settings': settings,
    };
    final response = await http.patch(
      Uri.parse('$baseUrl/api/users/me'),
      headers: _apiHeaders(authenticated: true),
      body: jsonEncode(body),
    );
    if (response.statusCode != 200) {
      return 1;
    }
    return 200;
  }
}

class Group {
  final String id;
  final String name;
  final String color;
  final int sortOrder;
  final int taskCount;

  Group({
    required this.id,
    required this.name,
    required this.color,
    this.sortOrder = 0,
    this.taskCount = 0,
  });

  factory Group.fromJson(Map<String, dynamic> json) {
    return Group(
      id: json['_id'] as String,
      name: json['name'] as String,
      color: json['color'] as String? ?? '#FFFFFF',
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      taskCount: (json['taskCount'] as num?)?.toInt() ?? 0,
    );
  }
}

//Data handling for list items
//Generated by Github Copilot, see Readme for prompt information

class Task {
  final String id;
  final String userId;
  final String name;
  final double importance;
  final int estPomodoros;
  final double priorityScore;
  final int sortOrder;
  final bool completed;
  final List<Subtask> subtasks;
  final String? description;
  final String? groupId;
  final String? parentTaskId;
  final String? dueDate;

  Task({
    required this.id,
    required this.userId,
    required this.name,
    required this.importance,
    required this.estPomodoros,
    required this.priorityScore,
    required this.sortOrder,
    required this.completed,
    required this.subtasks,
    this.description,
    this.groupId,
    this.parentTaskId,
    this.dueDate,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    final rawSubtasks = json['subtasks'] as List? ?? const [];

    return Task(
      id: json['_id'] as String,
      userId: json['userId'] as String? ?? '',
      name: json['name'] as String,
      importance: (json['importance'] as num?)?.toDouble() ?? 0,
      estPomodoros: (json['estPomodoros'] as num?)?.toInt() ?? 1,
      priorityScore: (json['priorityScore'] as num?)?.toDouble() ?? 0,
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      completed: json['completed'] as bool? ?? false,
      subtasks: rawSubtasks
          .map(
            (item) => Subtask.fromJson(Map<String, dynamic>.from(item as Map)),
          )
          .toList(),
      description: json['description'] as String?,
      groupId: json['groupId'] as String?,
      parentTaskId: json['parentTaskId'] as String?,
      dueDate: json['dueDate'] as String?,
    );
  }
}

class Subtask {
  final String id;
  final String parentTaskId;
  final String name;
  final double importance;
  final int estPomodoros;
  final double priorityScore;
  final bool completed;

  Subtask({
    required this.id,
    required this.parentTaskId,
    required this.name,
    required this.importance,
    required this.estPomodoros,
    required this.priorityScore,
    required this.completed,
  });

  factory Subtask.fromJson(Map<String, dynamic> json) {
    return Subtask(
      id: json['_id'] as String,
      parentTaskId: json['parentTaskId'] as String? ?? '',
      name: json['name'] as String,
      importance: (json['importance'] as num?)?.toDouble() ?? 0,
      estPomodoros: (json['estPomodoros'] as num?)?.toInt() ?? 1,
      priorityScore: (json['priorityScore'] as num?)?.toDouble() ?? 0,
      completed: json['completed'] as bool? ?? false,
    );
  }
}

class TaskCard extends StatelessWidget {
  final Task task;

  const TaskCard({super.key, required this.task});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Checkbox(value: task.completed, onChanged: (bool? value) {}),

        title: Text(task.name),
        subtitle: Text(
          (task.description ?? '') + '\n  Confidence' + task.importance.toString() + '/10   Due ' + (task.dueDate ?? 'N/A'),
        ),
   
        trailing: Wrap(
          spacing: 10,
          children: [
            Icon(Icons.timer),
            Text(task.estPomodoros.toString() + ' Pomodoros'),
            IconButton(
              icon: Icon(Icons.expand_circle_down_outlined),              
              onPressed: (
                //placeholder edit/delete  
              ) {},
            ),
          ],
        ),
      ),
    );
  }
}

void main() {
  runApp(
    MaterialApp(
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        '/home': (context) => const HomePage(),
        '/newitem': (context) => const NewItemPage(),
        '/register': (context) => const RegisterPage(),
        '/email': (context) => const EmailCodeConfirm(),
        '/password': (context) => const PasswordConfirmationSend(),
        '/passwordcode': (context) => PasswordCodeConfirm(),
        '/createGroup': (context) => const NewGroupPage(),
      },
      debugShowCheckedModeBanner: false,
    ),
  );
}

// HomePage is the main screen of the app
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {

  TaskAPI taskAPI = TaskAPI();

  /*
  //Testing data
  List<Task> loadedTasks = List.generate(
    5,
    (i) => Task(
      id: 'null',
      userId: 'null',
      name: 'Task Test $i',
      importance: (i).toDouble(),
      estPomodoros: i,
      priorityScore: i.toDouble(),
      sortOrder: i,
      completed: false,
      subtasks: [],
    ),
  );

  */

  Future<List<Task>> loadedTasks = Future.value([]);

  int currentPageIndex = 0;

  @override
  void initState() {
    super.initState();
    loadedTasks = taskAPI.getTasks();
  }

  Widget _taskList({bool? completed}) {
    return FutureBuilder<List<Task>>(
      future: loadedTasks,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        final tasks = (snapshot.data ?? <Task>[])
            .where((task) => completed == null || task.completed == completed)
            .toList();
        if (tasks.isEmpty) {
          return Center(child: Text('No tasks available'));
        }
        return ListView.builder(
          itemCount: tasks.length,
          itemBuilder: (context, index) => TaskCard(task: tasks[index]),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    //final ThemeData theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("Home"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: Icon(Icons.settings),
            onPressed: () {
              //Navigator.pushNamed(context, '/settings');
            },
          ),
        ],
      ),

      //Navigation bar sourced from https://www.geeksforgeeks.org/flutter/bottomnavigationbar-widget-in-flutter/
      bottomNavigationBar: NavigationBar(
        onDestinationSelected: (int index) {
          setState(() {
            currentPageIndex = index;
          });
        },
        indicatorColor: Colors.lightGreen,
        selectedIndex: currentPageIndex,
        destinations: <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.home),
            icon: Icon(Icons.home_outlined),
            label: 'Welcome, $displayName',
          ),
          NavigationDestination(
            icon: Badge(child: Icon(Icons.calendar_today_outlined)),
            label: 'Calendar',
          ),
          NavigationDestination(
            icon: Badge(child: Icon(Icons.plus_one_outlined)),
            label: 'New Item',
          ),
          NavigationDestination(
            icon: Badge(child: Icon(Icons.pages_sharp)),
            label: 'Groups',
          ),
          NavigationDestination(
            icon: Badge(child: Icon(Icons.punch_clock_outlined)),
            label: 'Archive',
          ),
        ],
      ),

      body: <Widget>[
        /// Home page
        ///

        _taskList(),

        /// Notifications page
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              TableCalendar(
                firstDay: DateTime.utc(2026, 11, 2),
                lastDay: DateTime.utc(2066, 11, 2),
                focusedDay: DateTime.now(),
              ),

              Expanded(child: _taskList()),
            ],
          ),
        ),

        ///New item
        SizedBox(
          height: 65,
          width: 360,
          child: Row(
            children: [
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text(
                      'Enter new item page',
                      style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: () {
                      Navigator.pushNamed(context, '/newitem');
                    },
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text(
                      'Enter new group page',
                      style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: () {
                      Navigator.pushNamed(context, '/newgroup');
                    },
                  ),
                ),
              ),
            ],
          ),
        ),

        /// Groups page
        Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Expanded(child: _taskList()),
            ],
          ),
        ),

        Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Expanded(child: _taskList(completed: true)),
            ],
          ),
        ),
      ][currentPageIndex],
    );
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  LoginPageState createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage> {
  String email = "";
  String password = "";

  List<Task> loadedTasks = [];

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final LoginAPI login = LoginAPI();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Login"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Center(
                child: SizedBox(
                  width: 200,
                  height: 100,
                  child: Text(
                    'Welcome to Small Steps',
                    style: TextStyle(fontSize: 30, color: Colors.blueGrey),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: emailController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Email address',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: passwordController,
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                  hintText: '8 characters minimum with special character',
                ),
              ),
            ),
            SizedBox(
              height: 65,
              width: 360,
              child: Row(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20.0),
                      child: ElevatedButton(
                        child: Text(
                          'Sign In',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () async {
                          email = emailController.text;
                          password = passwordController.text;

                          if ((email == "") || (password == "")) {
                            showDialog(
                              context: context,
                              builder: (BuildContext context) => AlertDialog(
                                title: const Text('Invalid Input'),
                                content: const Text(
                                  'One or more fields are missing',
                                ),
                                actions: <Widget>[
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, 'OK'),
                                    child: const Text('OK'),
                                  ),
                                ],
                              ),
                            );
                          }

                          if ((password.length < 8)) {
                            showDialog(
                              context: context,
                              builder: (BuildContext context) => AlertDialog(
                                title: const Text('Invalid Input'),
                                content: const Text(
                                  'Password is less than 8 characters',
                                ),
                                actions: <Widget>[
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, 'OK'),
                                    child: const Text('OK'),
                                  ),
                                ],
                              ),
                            );
                          }

                          if ((email != "") &&
                              (password != "") &&
                              (password.length >= 8)) {
                            final attempt = await login.login(email, password);
                            if (context.mounted != true) {
                              return;
                            }

                            if (attempt != null) {
                              if (attempt.isVerified == true) {
                                Navigator.pushNamed(context, '/home');
                              } else {
                                Navigator.pushNamed(context, '/email');
                              }
                            } else {
                              showDialog(
                                context: context,
                                builder: (BuildContext context) => AlertDialog(
                                  title: const Text('Invalid Input'),
                                  content: const Text(
                                    'Either email is unregistered or password is incorrect',
                                  ),
                                  actions: <Widget>[
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.pop(context, 'OK'),
                                      child: const Text('OK'),
                                    ),
                                  ],
                                ),
                              );
                            }
                          }
                        },
                      ),
                    ),
                  ),
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20.0),
                      child: ElevatedButton(
                        child: Text(
                          'Register',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          Navigator.pushNamed(context, '/register');
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 50),

            Center(
              child: Row(
                children: [
                  Padding(
                    padding: const EdgeInsets.only(left: 1.0),
                    child: InkWell(
                      onTap: () {
                        Navigator.pushNamed(context, '/password');
                      },
                      child: Text(
                        'Forgot Password',
                        style: TextStyle(fontSize: 14, color: Colors.blue),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NewItemPage extends StatefulWidget {
  const NewItemPage({super.key});

  @override
  NewItemState createState() => NewItemState();
}

class NewItemState extends State<NewItemPage> {
  TaskAPI taskAPI = TaskAPI();
  late Future<List<Group>> groups;

  String taskName = "";
  String description = "";

  String groupId = "";

  double importance = 0.1;
  String dueDate = "";
  int estPomodoros = 0;

  int taskSuccess = 0;

  @override
  void initState() {
    super.initState();

    groups = taskAPI.getGroups();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(labelText: 'Task Name'),
                onChanged: (value) {
                  setState(() {
                    taskName = value;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(labelText: 'Description'),
                onChanged: (value) {
                  setState(() {
                    description = value;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  Text("Group:"),
                  Builder(
                    builder: (context) {
                      return FutureBuilder<List<Group>>(
                        future: groups,
                        builder: (context, snapshot) {
                          if (!snapshot.hasData || snapshot.data!.isEmpty) {
                            return Text('No groups found');
                          } else {
                            return DropdownButton<String>(
                              value: groupId.isEmpty ? null : groupId,
                              hint: const Text('Select Group'),
                              items: snapshot.data!.map((group) {
                                return DropdownMenuItem<String>(
                                  value: group.id,
                                  child: Text(group.name),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  groupId = value ?? '';
                                });
                              },
                            );
                          }
                        },
                      );
                    },
                  ),
                  ElevatedButton(
                    onPressed: () async {
                      await Navigator.pushNamed(context, '/createGroup');

                      if (!mounted) return;

                      setState(() {
                        groupId = '';
                        groups = taskAPI.getGroups();
                      });
                    },
                    child: Text('Create new group'),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text('Importance:'),
                  Slider(
                    value: importance,
                    min: 0.1,
                    max: 1.0,
                    divisions: 9,
                    label: importance.toStringAsFixed(1),
                    onChanged: (value) {
                      setState(() {
                        importance = value;
                      });
                    },
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(
                  labelText: 'Due Date (format YYYY-MM-DD)',
                ),
                onChanged: (value) {
                  setState(() {
                    dueDate = value;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Time Estimate:',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: TextField(
                decoration: InputDecoration(labelText: 'Estimated Pomodoros'),
                onChanged: (value) {
                  setState(() {
                    estPomodoros = int.tryParse(value) ?? 0;
                  });
                },
              ),
            ),
            SizedBox(
              height: 65,
              width: 360,
              child: Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: ElevatedButton(
                  child: Text(
                    'Submit',
                    style: TextStyle(color: Colors.green, fontSize: 20),
                  ),
                  onPressed: () async {
                    taskSuccess = await TaskAPI().createTask(
                      taskName,
                      importance,
                      estPomodoros,
                      description,
                      groupId,
                      dueDate,
                    );

                    if (context.mounted != true){
                      return;
                    }

                    if (taskSuccess == 201) {
                      Navigator.of(context).pop();
                    } else {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text('Error'),
                            content: Text('Error with task creation'),
                            actions: [
                              TextButton(
                                child: Text('OK'),
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                              ),
                            ],
                          );
                        },
                      );
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class NewGroupPage extends StatefulWidget {
  const NewGroupPage({super.key});

  @override
  NewGroupState createState() => NewGroupState();
}

class NewGroupState extends State<NewGroupPage> {

  TaskAPI taskAPI = TaskAPI();

  String groupName = "";
  String groupColor = "#FFFFFF";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("New Group"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  Text('Name:'),
                  TextField(
                    onChanged: (value) {
                      setState(() {
                        groupName = value;
                      });
                    },
                    decoration: InputDecoration(
                      labelText: 'Group Name',
                    ),
                  ),
                  DropdownButton(items: const[
                    DropdownMenuItem(
                      value: "#10B981",
                      child: Text("Green"),
                    ),
                    DropdownMenuItem(
                      value: "#F59E0B",
                      child: Text("Orange"),
                    ),
                    DropdownMenuItem(
                      value: "#3B82F6",
                      child: Text("Blue"),
                    ),
                    DropdownMenuItem(
                      value: "#8B5CF6",
                      child: Text("Purple"),
                    ),
                    DropdownMenuItem(
                      value: "#EC4899",
                      child: Text("Pink"),
                    ),
                    DropdownMenuItem(
                      value: "#6B7280",
                      child: Text("Grey"),
                    )
                  ], onChanged: (value) {
                    setState(() {
                      groupColor = value!;
                    });
                  }),

                  ElevatedButton(
                    onPressed: () async {

                      int groupSuccess = await taskAPI.createGroup(groupName, groupColor);
                      if (groupSuccess == 409) {
                      
                      if(context.mounted != true){
                        return;
                      }
                        
                        showDialog(
                          
                          context: context,
                          builder: (BuildContext context) {
                            return AlertDialog(
                              title: Text('Group already exists'),
                              content: Text('Group name already exists'),
                              actions: [
                                TextButton(
                                  onPressed: () {
                                    Navigator.of(context).pop();
                                  },
                                  child: Text('OK'),
                                ),
                              ],
                            );
                          },
                        );
                      } else {
                        if(context.mounted != true){
                        return;
                      }

                        Navigator.of(context).pop();
                      }
                    },
                    child: Text("Create Group"),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


class RegisterPage extends StatefulWidget {
  const RegisterPage({super.key});

  @override
  RegisterState createState() => RegisterState();
}

class RegisterState extends State<RegisterPage> {
  String email = "";
  String passwordOne = "";
  String passwordTwo = "";

  final emailController = TextEditingController();
  final nameController = TextEditingController();
  final passwordControllerOne = TextEditingController();
  final passwordControllerTwo = TextEditingController();

  final LoginAPI login = LoginAPI();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    emailController.dispose();
    nameController.dispose();
    passwordControllerOne.dispose();
    passwordControllerTwo.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("Register Account"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  Center(
                    child: SizedBox(
                      width: 200,
                      height: 100,
                      child: Text(
                        'Welcome to Small Steps',
                        style: TextStyle(fontSize: 30, color: Colors.green),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Enter your desired information to proceed.',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: emailController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Email address',
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: nameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Username',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 15.0,
                right: 15.0,
                top: 15,
                bottom: 0,
              ),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: passwordControllerOne,
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                  hintText: '8 characters minimum with special character',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 15.0,
                right: 15.0,
                top: 15,
                bottom: 0,
              ),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: passwordControllerTwo,
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Confirm Password',
                  hintText: '8 characters minimum with special character',
                ),
              ),
            ),

            SizedBox(
              height: 65,
              width: 360,
              child: Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: ElevatedButton(
                  child: Text(
                    'Next',
                    style: TextStyle(color: Colors.green, fontSize: 20),
                  ),
                  onPressed: () async {
                    email = emailController.text;
                    displayName = nameController.text;
                    passwordOne = passwordControllerOne.text;
                    passwordTwo = passwordControllerTwo.text;

                    if ((email == "") ||
                        (displayName == "") ||
                        (passwordOne == "") ||
                        (passwordTwo == "")) {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) => AlertDialog(
                          title: const Text('Invalid Input'),
                          content: const Text('One or more fields are missing'),
                          actions: <Widget>[
                            TextButton(
                              onPressed: () => Navigator.pop(context, 'OK'),
                              child: const Text('OK'),
                            ),
                          ],
                        ),
                      );
                    }

                    if (passwordOne != passwordTwo) {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) => AlertDialog(
                          title: const Text('Invalid Input'),
                          content: const Text('Passwords do not match'),
                          actions: <Widget>[
                            TextButton(
                              onPressed: () => Navigator.pop(context, 'OK'),
                              child: const Text('OK'),
                            ),
                          ],
                        ),
                      );
                    }

                    if ((email != "") &&
                        (displayName != "") &&
                        (passwordOne != "") &&
                        (passwordTwo != "") &&
                        (passwordOne == passwordTwo) &&
                        (passwordOne.length >= 8)) {
                      final result = await login.register(
                        displayName,
                        email,
                        passwordOne,
                      );
                      if (context.mounted != true) {
                        return;
                      }

                      if (result != 201) {
                        showDialog(
                          context: context,
                          builder: (BuildContext context) => AlertDialog(
                            title: const Text('Registration Failed'),
                            content: const Text(
                              'Registration error. Try again',
                            ),
                            actions: <Widget>[
                              TextButton(
                                onPressed: () => Navigator.pop(context, 'OK'),
                                child: const Text('OK'),
                              ),
                            ],
                          ),
                        );

                        return;
                      } else {
                        Navigator.pushNamed(context, '/email');
                      }
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class EmailCodeConfirm extends StatefulWidget {
  const EmailCodeConfirm({super.key});

  @override
  EmailCodeConfirmState createState() => EmailCodeConfirmState();
}

class EmailCodeConfirmState extends State<EmailCodeConfirm> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("Confirm Email"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Center(
                child: SizedBox(
                  width: 200,
                  height: 100,
                  child: Text(
                    'Welcome to Small Steps',
                    style: TextStyle(fontSize: 30, color: Colors.blueGrey),
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Registry success. Check your email to verify your account.',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 65,
              width: 360,
              child: Row(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20.0),
                      child: ElevatedButton(
                        child: Text(
                          'Confirm',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          Navigator.pushNamed(context, '/');
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PasswordConfirmationSend extends StatefulWidget {
  const PasswordConfirmationSend({super.key});

  @override
  PasswordConfirmState createState() => PasswordConfirmState();
}

class PasswordConfirmState extends State<PasswordConfirmationSend> {
  final emailController = TextEditingController();
  String email = "";

  final LoginAPI login = LoginAPI();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("Reset Password"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  Center(
                    child: SizedBox(
                      width: 200,
                      height: 100,
                      child: Text(
                        'Welcome to Small Steps',
                        style: TextStyle(fontSize: 30, color: Colors.green),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Enter your registered email. We\'ll send you a code.',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: emailController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Email address',
                ),
              ),
            ),
            SizedBox(
              height: 65,
              width: 360,
              child: Row(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20.0),
                      child: ElevatedButton(
                        child: Text(
                          'Next',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),

                        onPressed: () async {
                          email = emailController.text;

                          final attempt = await login.forgotPassword(email);
                          if (context.mounted != true) {
                            return;
                          }

                          if (attempt == 200) {
                            Navigator.pushNamed(context, '/passwordcode');
                            return;
                          } else {
                            showDialog(
                              context: context,
                              builder: (context) {
                                return AlertDialog(
                                  title: Text('Error'),
                                  content: Text(
                                    'Error with email. Please try again',
                                  ),
                                  actions: [
                                    TextButton(
                                      onPressed: () {
                                        Navigator.of(context).pop();
                                      },
                                      child: Text('OK'),
                                    ),
                                  ],
                                );
                              },
                            );
                          }
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class PasswordCodeConfirm extends StatefulWidget {
  const PasswordCodeConfirm({super.key});

  @override
  PasswordCodeConfirmState createState() => PasswordCodeConfirmState();
}

class PasswordCodeConfirmState extends State<PasswordCodeConfirm> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("Password Reset"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  Center(
                    child: SizedBox(
                      width: 200,
                      height: 100,
                      child: Text(
                        'Welcome to Small Steps',
                        style: TextStyle(fontSize: 30, color: Colors.green),
                      ),
                    ),
                  ),
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Check your email and follow the link. Then reattempt login',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 65,
              width: 360,
              child: Row(
                children: [
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(top: 20.0),
                      child: ElevatedButton(
                        child: Text(
                          'Return',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          Navigator.pushNamed(context, '/');
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  SettingsState createState() => SettingsState();
}

class SettingsState extends State<SettingsPage> {
  String displayName = "";
  String theme = "dark";
  double importance = 0.2;
  double dueDate = 0.7;
  double time = 0.1;

  OptionAPI optionAPI = OptionAPI();

  TextEditingController displayNameController = TextEditingController();
  TextEditingController importanceController = TextEditingController();
  TextEditingController dueDateController = TextEditingController();
  TextEditingController timeController = TextEditingController();
  TextEditingController themeController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("User Settings"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Change options as desired:',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: displayNameController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Display Name',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Column(
                children: [
                  SizedBox(
                    width: 200,
                    height: 100,
                    child: Text(
                      'Sort weights:',
                      style: TextStyle(fontSize: 15, color: Colors.green),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: importanceController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Importance',
                  hintText: 'Default 0.2',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 15.0,
                right: 15.0,
                top: 15,
                bottom: 0,
              ),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: dueDateController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Due Date',
                  hintText: 'Default 0.7',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 15.0,
                right: 15.0,
                top: 15,
                bottom: 0,
              ),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: timeController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Time',
                  hintText: 'Default 0.1',
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                left: 15.0,
                right: 15.0,
                top: 15,
                bottom: 0,
              ),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: themeController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Theme',
                  hintText: 'Default Dark',
                ),
              ),
            ),

            SizedBox(
              height: 65,
              width: 360,
              child: Padding(
                padding: const EdgeInsets.only(top: 20.0),
                child: ElevatedButton(
                  child: Text(
                    'Set',
                    style: TextStyle(color: Colors.green, fontSize: 20),
                  ),
                  onPressed: () async {
                    displayName = displayNameController.text;

                    if (importanceController.text.isEmpty) {
                      importance = 0.2;
                    } else {
                      importance = double.parse(importanceController.text);
                    }

                    if (dueDateController.text.isEmpty) {
                      dueDate = 0.7;
                    } else {
                      dueDate = double.parse(dueDateController.text);
                    }

                    if (timeController.text.isEmpty) {
                      time = 0.1;
                    } else {
                      time = double.parse(timeController.text);
                    }

                    if (themeController.text.isEmpty) {
                      theme = 'Dark';
                    } else {
                      theme = themeController.text;
                    }

                    // Weights must equal one combined
                    if ((importance + dueDate + time) != 1.0) {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: Text('Error'),
                            content: Text('Total weight sum must equal 1.0'),
                            actions: [
                              TextButton(
                                child: Text('OK'),
                                onPressed: () {
                                  Navigator.of(context).pop();
                                },
                              ),
                            ],
                          );
                        },
                      );
                    } else {
                      int result = await optionAPI.patchCurrentUser(
                        displayName,
                        theme,
                        importance,
                        dueDate,
                        time,
                      );
                      if (context.mounted != true) {
                        return;
                      }

                      if (result != 200) {
                        showDialog(
                          context: context,
                          builder: (BuildContext context) {
                            return AlertDialog(
                              title: Text('Error'),
                              content: Text('Failed to update user settings'),
                              actions: [
                                TextButton(
                                  child: Text('OK'),
                                  onPressed: () {
                                    Navigator.of(context).pop();
                                  },
                                ),
                              ],
                            );
                          },
                        );
                      }
                    }
                  },
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
