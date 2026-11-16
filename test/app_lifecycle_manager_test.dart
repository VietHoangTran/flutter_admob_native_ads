import 'package:flutter/widgets.dart';
import 'package:flutter_admob_native_ads/src/services/app_lifecycle_manager.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('ignores a lifecycle callback after disposal during dispatch', (
    tester,
  ) async {
    final binding = tester.binding;
    binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
    final manager = AppLifecycleManager();
    final disposer = _DisposingObserver(manager);
    binding.addObserver(disposer);
    addTearDown(() => binding.removeObserver(disposer));
    manager.initialize();

    // The binding snapshots its observers before the first callback disposes
    // the manager. The manager still receives this inactive notification.
    binding.handleAppLifecycleStateChanged(AppLifecycleState.inactive);

    expect(tester.takeException(), isNull);
  });
}

class _DisposingObserver with WidgetsBindingObserver {
  _DisposingObserver(this.manager);

  final AppLifecycleManager manager;

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive) manager.dispose();
  }
}
