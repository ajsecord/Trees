//
//  ViewController.m
//  TreesViewer
//
//  Created by Adrian on 8/13/16.
//  Copyright © 2016 Adrian Secord. All rights reserved.
//

#import "ViewController.h"

#include "trees_version.h"

@interface ViewController ()
@property(nonatomic) IBOutlet NSTextField *versionLabel;
@end

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self updateVersionLabel];
}


- (void)setRepresentedObject:(id)representedObject {
    [super setRepresentedObject:representedObject];

    // Update the view, if already loaded.
}

#pragma mark Private

- (void)updateVersionLabel {
    NSString *label = [NSString stringWithFormat:@"Library version %@",
                          [NSString stringWithUTF8String:trees_get_version()]];
    self.versionLabel.stringValue = label;
}

@end
