Hello World
===========
This is a simple "Hello World" application written in C#. It demonstrates how to print a message to the console.
To run this application, follow these steps:
1. Make sure you have the .NET SDK installed on your machine. You can download it from the official Microsoft website: https://dotnet.microsoft.com/download
1. Create a new console application using the command line:
   ```
   dotnet new console -o HelloWorld
   ```
2. Navigate to the project directory:
   ```
   cd HelloWorld
   ```
3. Run the application:
   ```
   dotnet run
   ```
4. You should see the output "Hello World" printed to the console.
1. You can also open the project in an IDE like Visual Studio or Visual Studio Code and run it from there.
1. Feel free to modify the code to print different messages or add additional functionality!
1. Here is the code for the `Program.cs` file:
```csharp
using System;
namespace HelloWorld
{
	class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine("Hello World");
		}
	}
}
```

This code defines a simple console application that prints "Hello World" to the console when executed. The `Main` method is the entry point of the application, and it uses the `Console.WriteLine` method to output the message.
Feel free to explore and experiment with the code to learn more about C# programming!

High level program structure beginning C# 6+
============================================

```csharp
Console.WriteLine("Hello World");
```


