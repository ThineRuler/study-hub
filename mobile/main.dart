import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:table_calendar/table_calendar.dart';

//Global variables for cross-page states
String displayName = "";
String userID = "";
bool verifiedState = false;

String theme = "dark";
double importance = 0;
double dueDate = 0;
double time = 0;

class LoginInfo {
  String email = "";
  String password = "";
  bool isVerified = false;

  LoginInfo({
    required this.email,
    required this.password,
    required this.isVerified,
  });

  factory LoginInfo.fromJson(Map<String, dynamic> json) {
    displayName = json['displayName'];
    userID = json['_id'];
    theme = json['theme'];
    importance = json['importance'];
    dueDate = json['dueDate'];
    time = json['time'];

    verifiedState = json['email'];

    return LoginInfo(
      email: json['id'],
      password: json['name'],
      isVerified: json['email'],
    );
  }
}

class TaskInfo {
  String taskID = "";
  String taskName = "";
  double importance = 0;
  int estPomodoros = 0;
  double priorityScore = 0;
  int sortOrder = 0;
  bool completed = false;
  /*
  "subtasks": [
    {
      "_id": "674100000000000000000002",
      "parentTaskId": "674100000000000000000001",
      "name": "Review notes",
      "importance": 0.5,
      "estPomodoros": 1,
      "priorityScore": 0.55,
      "completed": false
    }
  ]
  */

  /*
  TaskInfo({required this.taskID, required this.taskName, required this.estPomodoros});

  factory TaskInfo.fromJson(Map<String, dynamic> json) {
    
  }
  */
}

void main() {
  runApp(
    MaterialApp(
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        '/home': (context) => const HomePage(),
        '/newitem': (context) => const NewItemPage(),
        '/passwordreset': (context) => const PasswordResetPage(),
        '/register': (context) => const RegisterPage(),
        '/email': (context) => const EmailConfirmationSend(),
        '/emailcode': (context) => const EmailCodeConfirm(),
        '/password': (context) => const PasswordConfirmationSend(),
        '/passwordcode': (context) => PasswordCodeConfirm(),
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
  int currentPageIndex = 0;
  
  @override
  Widget build(BuildContext context) {

    final ThemeData theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("Home"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
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
        destinations: const <Widget>[
          NavigationDestination(
            selectedIcon: Icon(Icons.home),
            icon: Icon(Icons.home_outlined),
            label: 'Home',
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
        Card(
          shadowColor: Colors.transparent,
          margin: const EdgeInsets.all(8.0),
          child: SizedBox.expand(
            child: Center(
              child: Text('Temporary Home', style: theme.textTheme.titleLarge),
            ),
          ),
        ),

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
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Temp Calendar'),
                  subtitle: Text(''),
                ),
              ),
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
                ],
              ),
            ),
        /// Groups page 
        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Temp groups'),
                  subtitle: Text(''),
                ),
              ),
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Temp groups'),
                  subtitle: Text(''),
                ),
              ),
            ],
          ),
        ),

        const Padding(
          padding: EdgeInsets.all(8.0),
          child: Column(
            children: <Widget>[
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Temp Archive'),
                  subtitle: Text(''),
                ),
              ),
              Card(
                child: ListTile(
                  leading: Icon(Icons.notifications_sharp),
                  title: Text('Temp Archive'),
                  subtitle: Text(''),
                ),
              ),
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

  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    emailController.dispose();
    passwordController.dispose();
    super.dispose();
  }

  static Future<LoginInfo?> getLoginInfo() async {
    final accountInfo = await http.get(Uri.parse('/api/users/me'));

    return LoginInfo.fromJson(json.decode(accountInfo.body));
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
                        onPressed: () {
                          //final LoginInfo attempt = getLoginInfo();

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
                                    onPressed: () => Navigator.pop(context, 'OK'),
                                    child: const Text('OK'),
                                  ),
                                ],
                              ),
                            );
                          }

                          if((password.length < 8)){
                            showDialog(
                              context: context,
                              builder: (BuildContext context) => AlertDialog(
                                title: const Text('Invalid Input'),
                                content: const Text(
                                  'Password is less than 8 characters',
                                ),
                                actions: <Widget>[
                                  TextButton(
                                    onPressed: () => Navigator.pop(context, 'OK'),
                                    child: const Text('OK'),
                                  ),
                                ],
                              ),
                            );

                          }

                          //placeholder

                          if ((email != "") && (password != "") && (password.length >= 8) && (verifiedState == false)) {
                            //Navigator.pushNamed(context, '/email');
                            Navigator.pushNamed(context, '/home');
                          } else {
                            //Navigator.pushNamed(context, '/home');
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
  String displayName = "";
  String theme = "dark";
  double importance = 0;
  double dueDate = 0;
  double time = 0;

  String taskName = "";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: BackButton(),
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    );
  }
}

class PasswordResetPage extends StatefulWidget {
  const PasswordResetPage({super.key});

  @override
  PasswordResetState createState() => PasswordResetState();
}

class PasswordResetState extends State<PasswordResetPage> {
  String newPasswordOne = "";
  String newPasswordTwo = "";
  String oldPassword = "";

  final passwordControllerOne = TextEditingController();
  final passwordControllerTwo = TextEditingController();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    passwordControllerOne.dispose();
    passwordControllerTwo.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Reset Password"),
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
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: passwordControllerOne,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'New Password',
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: passwordControllerTwo,
                obscureText: true,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Confirm New Password',
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
                          'Confirm',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          //final LoginInfo attempt = getLoginInfo();

                          newPasswordOne = passwordControllerOne.text;
                          newPasswordTwo = passwordControllerTwo.text;

                          if ((newPasswordOne == "") ||
                              (newPasswordTwo == "")) {
                            (BuildContext context) => AlertDialog(
                              title: const Text('Invalid Input'),
                              content: const Text(
                                'One or more fields are missing',
                              ),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () => Navigator.pop(context, 'OK'),
                                  child: const Text('OK'),
                                ),
                              ],
                            );
                          }

                          if (newPasswordOne == newPasswordTwo) {
                            //placeholder
                            /* 
                            if (newPasswordOne == oldPassword) {
                              (BuildContext context) => AlertDialog(
                                title: const Text('Invalid Input'),
                                content: const Text(
                                  'New password is the same as old one',
                                ),
                                actions: <Widget>[
                                  TextButton(
                                    onPressed: () =>
                                        Navigator.pop(context, 'OK'),
                                    child: const Text('OK'),
                                  ),
                                ],
                              );
                            } else {
                            
                              //placeholder
                              Navigator.pushNamed(context, '/');
                            }
                            */
                            
                            if((newPasswordOne == newPasswordTwo) && (newPasswordOne.length >= 8)){
                              Navigator.pushNamed(context, '/');
                            }
                          
                          } else {
                            (BuildContext context) => AlertDialog(
                              title: const Text('Invalid Input'),
                              content: const Text(
                                'Entered passwords do not match',
                              ),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () => Navigator.pop(context, 'OK'),
                                  child: const Text('OK'),
                                ),
                              ],
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
                  onPressed: () {
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
                      ));
                      
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

                    //placeholder
                    if ((email != "") &&
                        (displayName != "") &&
                        (passwordOne != "") &&
                        (passwordTwo != "") && (passwordOne == passwordTwo) && (passwordOne.length >= 8)) {
                          Navigator.pushNamed(context, '/email');
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

class EmailConfirmationSend extends StatefulWidget {
  const EmailConfirmationSend({super.key});

  @override
  EmailConfirmState createState() => EmailConfirmState();
}

class EmailConfirmState extends State<EmailConfirmationSend> {
  String email = "";
  final emailController = TextEditingController();

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
        title: const Text("Confirm Email"),
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
                        style: TextStyle(fontSize: 30, color: Colors.blueGrey),
                      ),
                    ),
                  ),
                  Center(
                    child: SizedBox(
                      width: 200,
                      height: 100,
                      child: Text(
                        'Enter your registered email address. We will send you a code.',
                        style: TextStyle(fontSize: 30, color: Colors.black),
                      ),
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

                        onPressed: () {
                          email = emailController.text;
                          //placeholder
                          Navigator.pushNamed(context, '/emailcode');
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

class EmailCodeConfirm extends StatefulWidget {
  const EmailCodeConfirm({super.key});

  @override
  EmailCodeConfirmState createState() => EmailCodeConfirmState();
}

class EmailCodeConfirmState extends State<EmailCodeConfirm> {
  String enteredCode = "";
  String realCode = "";

  final codeController = TextEditingController();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    codeController.dispose();
    super.dispose();
  }

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
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: codeController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Confirmation Code',
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
                          'Confirm',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          //placeholder

                          enteredCode = codeController.text;

                          Navigator.pushNamed(context, '/');
                          /*
                          if (enteredCode == realCode) {
                            verifiedState = true;
                            Navigator.pushNamed(context, '/');
                          } else {
                            (BuildContext context) => AlertDialog(
                              title: const Text('Invalid Input'),
                              content: const Text(
                                'Validation code does not match sent code',
                              ),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () => Navigator.pop(context, 'OK'),
                                  child: const Text('OK'),
                                ),
                              ],
                            );
                          }
                          */
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
                        style: TextStyle(fontSize: 30, color: Colors.blueGrey),
                      ),
                    ),
                  ),
                  Center(
                    child: SizedBox(
                      width: 200,
                      height: 100,
                      child: Text(
                        'Enter your registered email address. We will send you a code.',
                        style: TextStyle(fontSize: 30, color: Colors.black),
                      ),
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

                        onPressed: () {
                          //placeholder

                          Navigator.pushNamed(context, '/passwordcode');
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
  String enteredCode = "";
  String realCode = "";

  final codeController = TextEditingController();

  @override
  void dispose() {
    // Clean up the controller when the widget is disposed.
    codeController.dispose();
    super.dispose();
  }

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
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                controller: codeController,
                decoration: InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: 'Confirmation Code',
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
                          'Confirm',
                          style: TextStyle(color: Colors.green, fontSize: 20),
                        ),
                        onPressed: () {
                          //placeholder

                          enteredCode = codeController.text;

                          Navigator.pushNamed(context, '/passwordreset');
                          /*
                          if (enteredCode == realCode) {
                            verifiedState = true;
                            Navigator.pushNamed(context, '/passwordreset');
                          } else {
                            (BuildContext context) => AlertDialog(
                              title: const Text('Invalid Input'),
                              content: const Text(
                                'Validation code does not match sent code',
                              ),
                              actions: <Widget>[
                                TextButton(
                                  onPressed: () => Navigator.pop(context, 'OK'),
                                  child: const Text('OK'),
                                ),
                              ],
                            );
                          }
                          */
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
