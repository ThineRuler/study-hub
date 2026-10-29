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

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class HomePage extends StatelessWidget {
  const HomePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class NewItemPage extends StatelessWidget {
  const NewItemPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class CalendarPage extends StatelessWidget {
  const CalendarPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class ArchivePage extends StatelessWidget {
  const ArchivePage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class PasswordResetPage extends StatelessWidget {
  const PasswordResetPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class RegisterPage extends StatelessWidget {
  const RegisterPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class EmailConfirmationSend extends StatelessWidget {
  const EmailConfirmationSend({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}

class EmailCodeConfirm extends StatelessWidget {
  const EmailCodeConfirm({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("New Task"),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
      ),
    ); 
  }
}