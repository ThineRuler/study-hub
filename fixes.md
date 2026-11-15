# Fixes and features to make

- Change the accessibility settings icon from what looks like sliders, to something more commonly associated with accessiblity (person inside circle). Move it to the bottom right of the screen and have it fixed when scrolling.
- Remove the text that says "Web & Android · A work in progress, like all good things."
- Change the text that says "StudyHub · Small steps, room to grow." to "StudyHub · Made with love by UCF students <3"
- Add a Light/Dark Mode toggle button indicated by a moon or sun icon. By default it should match the user's browser theme. If it can't be identified, default to light. Once the user logs in, move the toggle to the Settings & Preferences page.

## Accessiblity Preferences
- Change Dyslexia Friendly font (Comic Sans) to OpenDyslexic
- Remove System Sans. Inter and System Sans offer no difference for some reason, but ultimately isn't neccesary.
- Turn the Reading Font selector into 2 toggle switches: Dyslexia mode (switches to OpenDyslexic and overwrites any font), and Bold Text (bolds the default or OpenDyslexic font depening which mode is on) 

## Credits
- Remove the block "A note of thanks"
- Change the text that says "BUILT WITH CARE, CREDITED WITH CARE" to "WHO WORKED ON STUDYHUB"
- Change the text that says "This is where we'll acknowledge the tools, assets, and people behind StudyHub." to "StudyHub was built by students with the intention to help others with piling assignments." Make this text have the same font size as the text that says "Tasks can feel heavy and long before any work begins. StudyHub helps break those tasks into bite-sized tasks that you can manage in just a day." in the about page.
- Add Tailwind to the list of libraries in "Libraries & frameworks"

## Dashboard (Workspace)
- Remove the Accessibilty Settings on the bottom left, since they are already included in Settings & Preferences
- Move the create task submenu up so that the dashboard does not cover it.
- There is a visual glitch where the section that includes Accessibility Settings, Settings & Preferences, and Log Out jump up a couple pixels when the create task button is pressed and the menu shows up. It goes back down when the menu is closed.

## Groups
- Add a three dot icon when focused on a group that when clicked, shows a submenu with the options Edit Group and Delete Group. Have a pencil icon next to edit, and a trash icon next to delete. Have the Delete Group button be in red text. Edit should show a menu similar to the Create Group menu.
- When viewing all groups, change the trash icon to the three dot icon that does the same thing as stated before.
- Add the ability to move groups around in the side bar and the groups page by dragging it with the mouse. The order should match on both the side bar and the page page.

## Settings
- Add a tab for customization. Add the theme toggle in here.
- Add a toggle for Daily Digest email. Gray out the time set if the toggle is off.