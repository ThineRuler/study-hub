import 'package:flutter/material.dart';

void main() {
  runApp(MaterialApp(
    initialRoute: '/',
    routes: {
      '/': (context) => const LoginPage(),
      '/home': (context) => const HomePage(),
      '/newitem': (context) => const NewItemPage(),
      '/calendar':(context) => const CalendarPage(),
      '/archive':(context) => const ArchivePage(),
      '/password':(context) => const PasswordResetPage(),
      '/register':(context) => const RegisterPage(),
      '/email':(context) => const EmailConfirmationSend(),
      '/emailcode':(context) => const EmailCodeConfirm()
    },
    debugShowCheckedModeBanner: false,
  )); //MaterialApp
}

// HomePage is the main screen of the app
class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomePageState createState() => HomePageState();
}

class HomePageState extends State<HomePage> {

  int objectIndex = 0;

  // Method to handle tab selection
  void tapObject(int index) {
    setState(() {
      objectIndex = index;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      //Navigation bar sourced from https://www.geeksforgeeks.org/flutter/bottomnavigationbar-widget-in-flutter/
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.calendar_today),
            label: 'Calendar',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.plus_one),
            label: 'New Item',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.pages_sharp),
            label: 'Summary',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.punch_clock),
            label: 'Archive',
          ),
        ],
        currentIndex: objectIndex,
        selectedItemColor: const Color.fromARGB(255, 33, 131, 38),
        onTap: tapObject,
      ),

    ); 
  }
}

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  LoginPageState createState() => LoginPageState();
}

class LoginPageState extends State<LoginPage>{

  String email = "null";
  String password = "null";
  String displayName = "null";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
      //Code used from https://www.geeksforgeeks.org/flutter/flutter-design-login-page-ui/
      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Center(
                child: Container(
                    width: 200,
                    height: 100,
                    child: Text('Welcome to Small Steps', style: TextStyle(fontSize: 30, color: Colors.blueGrey),)),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Email address',
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 15, bottom: 0),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Password',
                    hintText: '8 characters minimum with special character'),
              ),
            ),

          SizedBox(
            height: 65,
            width: 360,
            child: Container(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text('Sign In', style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: (){
                      
                    },

                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text('Register', style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: (){
                      
                    },

                  ),
                ),
              ),
          ),

            SizedBox(
              height: 50,
            ),
            Container(
                child: Center(
                  child: Row(
                    children: [

                      Padding(
                        padding: const EdgeInsets.only(left:1.0),
                        child: InkWell(
                          onTap: (){
                           
                          },
                            child: Text('Forgot Password', style: TextStyle(fontSize: 14, color: Colors.blue),)),
                      )
                    ],
                  ),
                )
            )
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
  
  String taskName = "null";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class CalendarPage extends StatefulWidget {
  const CalendarPage({super.key});

  @override
  CalendarState createState() => CalendarState();
}

class CalendarState extends State<CalendarPage> {
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class ArchivePage extends StatefulWidget {
  const ArchivePage({super.key});

  @override
  ArchiveState createState() => ArchiveState();
}

class ArchiveState extends State<ArchivePage> {
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
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
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
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
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Center(
                child: Container(
                    width: 200,
                    height: 100,
                    child: Text('Welcome to Small Steps', style: TextStyle(fontSize: 30, color: Colors.green),)),
              ),
              child: Container(
                    width: 200,
                    height: 100,
                    child: Text('Enter your desired information to proceed.', style: TextStyle(fontSize: 15, color: Colors.green),)),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Email address',
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Username',
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 15, bottom: 0),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Password',
                    hintText: '8 characters minimum with special character'),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(
                  left: 15.0, right: 15.0, top: 15, bottom: 0),
              //padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                obscureText: true,
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Confirm Password',
                    hintText: '8 characters minimum with special character'),
              ),
            ),

          SizedBox(
            height: 65,
            width: 360,
            child: Container(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text('Next', style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: (){
                      
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
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),

      body: SingleChildScrollView(
        child: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(top: 110.0),
              child: Center(
                child: Container(
                    width: 200,
                    height: 100,
                    child: Text('Welcome to Small Steps', style: TextStyle(fontSize: 30, color: Colors.blueGrey),)),
              ),
              child: Center(
                child: Container(
                    width: 200,
                    height: 100,
                    child: Text('Enter your registered email address. We'll send you a code.', style: TextStyle(fontSize: 30, color: Colors.black),)),
              ),
            ),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 15),
              child: TextField(
                decoration: InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Email address',
              ),
            ),

          SizedBox(
            height: 65,
            width: 360,
            child: Container(
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text('Cancel', style: TextStyle(color: Colors.white, fontSize: 20),
                    ),
                    onPressed: (){
                      
                    },

                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.only(top: 20.0),
                  child: ElevatedButton(
                    child: Text('Next', style: TextStyle(color: Colors.green, fontSize: 20),
                    ),
                    onPressed: (){
                      
                    },

                  ),
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
  CodeConfirmState createState() => CodeConfirmState();
}

class CodeConfirmState extends State<EmailCodeConfirm> {
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.green,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}