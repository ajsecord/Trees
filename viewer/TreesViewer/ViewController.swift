//
//  ViewController.swift
//  TreesViewer
//
//  Created by Adrian on 8/13/16.
//  Copyright © 2016 Adrian Secord. All rights reserved.
//

import Cocoa
import Trees

class ViewController: NSViewController {
    @IBOutlet weak var versionLabel: NSTextField?

    override func viewDidLoad() {
        super.viewDidLoad()
        self.versionLabel!.stringValue = "Library version " + String(cString: trees_get_version())
    }

    override var representedObject: AnyObject? {
        didSet {
        // Update the view, if already loaded.
        }
    }


}

