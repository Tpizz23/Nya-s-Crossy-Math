#!/usr/bin/env python3
"""Local development workflow utilities. Python 3.9+, no third-party packages."""
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import signal
import subprocess
import sys
from datetime import datetime, timezone
import uuid

VERSION = '1.0.0'
MARKER = '<!-- software-factory -->'


def write_json(path, value):
    path.write_text(json.dumps(value, indent=2) + '\n', encoding='utf-8')


def git(root, *args, required=True):
    result = subprocess.run(['git', '-C', str(root), *args], capture_output=True, text=True, timeout=30)
    if required and result.returncode:
        raise ValueError(result.stderr.strip() or 'Git command failed')
    return result.stdout.strip() if result.returncode == 0 else None


def project_root(value):
    root = Path(value).resolve()
    if not root.is_dir():
        raise ValueError('Project directory does not exist')
    actual = git(root, 'rev-parse', '--show-toplevel')
    if Path(actual).resolve() != root:
        raise ValueError('--project must point to the Git repository root')
    return root


def payload():
    script = Path(__file__).resolve()
    return script.parent / 'kit' if (script.parent / 'kit').is_dir() else script.parent.parent


def safe_path(root, relative):
    path = root / relative
    # Do not follow links for toolkit-managed writes, even inside the project.
    for part in (path, *path.parents):
        if part == root:
            break
        if part.is_symlink():
            raise ValueError('Refusing managed path through symlink: ' + str(part))
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Managed path escapes project')
    return path


def install(root):
    source = payload()
    target = safe_path(root, '.factory')
    files = [(p, target / p.relative_to(source)) for p in source.rglob('*')
             if p.is_file() and not any(x in {'tasks', 'bin', '__pycache__'} for x in p.relative_to(source).parts)]
    files.append((Path(__file__).resolve(), target / 'bin/factory.py'))
    # Validate all destinations before writing anything.
    for _, dest in files:
        safe_path(root, dest.relative_to(root))
        if dest.exists() and not dest.is_file():
            raise ValueError('Expected a file at ' + str(dest))
    for name in ('AGENTS.md', 'CLAUDE.md', 'GEMINI.md', '.gitignore'):
        path = safe_path(root, name)
        if path.exists() and not path.is_file():
            raise ValueError('Expected a file at ' + str(path))
    created = 0
    for src, dest in files:
        if dest.exists():
            continue
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(src, dest)
        created += 1
    pointer = ('\n\n' + MARKER + '\n## Software factory\n'
               'For development tasks, read `.factory/WORKFLOW.md` and `.factory/config.json`.\n'
               'Read only the relevant skills under `.factory/skills/`. Resume from the task record\n'
               'under `.factory/tasks/` and verify current Git state. Existing project instructions\n'
               'and explicit user choices take precedence over toolkit defaults.\n'
               '<!-- /software-factory -->\n')
    for name in ('AGENTS.md', 'CLAUDE.md', 'GEMINI.md'):
        path = root / name
        text = path.read_text(encoding='utf-8') if path.exists() else ''
        if MARKER not in text:
            path.write_text(text + pointer, encoding='utf-8')
    ignore = root / '.gitignore'
    text = ignore.read_text(encoding='utf-8') if ignore.exists() else ''
    entries = ['/.worktrees/', '/.factory/tasks/*/evidence/', '/.factory/tasks/*/delivery.md', '__pycache__/', '*.pyc']
    missing = [entry for entry in entries if entry not in text.splitlines()]
    if missing:
        ignore.write_text(text + '\n# Software factory local artifacts\n' + '\n'.join(missing) + '\n', encoding='utf-8')
    print('Installed {} new files in {} (existing files preserved)'.format(created, target))


def config(root, need_checks=False):
    path = safe_path(root, '.factory/config.json')
    if not path.is_file():
        raise ValueError('Run init before using the factory')
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or data.get('version') != 1:
        raise ValueError('Config must be an object with version: 1')
    base = data.get('base_ref')
    if not isinstance(base, str) or not base or base.startswith('-'):
        raise ValueError('base_ref must be a nonempty Git ref')
    checks = data.get('checks')
    if not isinstance(checks, list) or (need_checks and not checks):
        raise ValueError('Configure at least one real check in .factory/config.json')
    names = set()
    for check in checks:
        if not isinstance(check, dict):
            raise ValueError('Each check must be an object')
        name, argv = check.get('name'), check.get('argv')
        limit = check.get('timeout_seconds', 300)
        if not isinstance(name, str) or not name.strip() or name in names:
            raise ValueError('Check names must be nonempty and unique')
        names.add(name)
        if not isinstance(argv, list) or not argv or any(not isinstance(x, str) or not x or '\0' in x for x in argv):
            raise ValueError('Check argv must be a nonempty array of nonempty strings')
        if isinstance(limit, bool) or not isinstance(limit, (int, float)) or not math.isfinite(limit) or limit <= 0:
            raise ValueError('timeout_seconds must be a finite positive number')
    review = data.get('review', {})
    if not isinstance(review, dict):
        raise ValueError('review must be an object')
    iterations = review.get('max_iterations', 3)
    if type(iterations) is not int or iterations < 1:
        raise ValueError('review.max_iterations must be a positive integer')
    if not isinstance(review.get('provider', 'manual'), str):
        raise ValueError('review.provider must be a string')
    if type(review.get('required_for_delivery', True)) is not bool:
        raise ValueError('review.required_for_delivery must be a boolean')
    return data


def task_path(root, slug, must_exist=True):
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug) or len(slug) > 64:
        raise ValueError('Task ID must be 1-64 lowercase letters/digits separated by hyphens')
    path = safe_path(root, '.factory/tasks/' + slug)
    if must_exist and not (path / 'task.md').is_file():
        raise ValueError('Task does not exist: ' + slug)
    return path


def create_task(root, slug, title=None):
    config(root)
    path = task_path(root, slug, must_exist=False)
    if path.exists():
        raise ValueError('Task already exists: ' + slug)
    path.mkdir(parents=True)
    for name in ('task.md', 'review.md'):
        template = (root / '.factory/templates' / name).read_text(encoding='utf-8')
        (path / name).write_text(template.replace('{{TASK_ID}}', slug).replace('{{TITLE}}', title or slug), encoding='utf-8')
    print(path)


def worktree(root, slug, destination, base=None):
    data = config(root)
    task_path(root, slug, must_exist=False)
    ref = base or data['base_ref']
    if ref.startswith('-'):
        raise ValueError('Base ref cannot start with a dash')
    revision = git(root, 'rev-parse', '--verify', ref + '^{commit}', required=False)
    if not revision:
        raise ValueError('Base ref has no commit: {}. Commit a baseline or select --base.'.format(ref))
    dest = Path(destination).expanduser().resolve()
    if dest.exists():
        raise ValueError('Worktree destination must not exist')
    if dest.is_relative_to(root):
        if not dest.is_relative_to(root / '.worktrees'):
            raise ValueError('In-project worktrees must be under .worktrees/')
        ignored = subprocess.run(['git', '-C', str(root), 'check-ignore', '-q', '.worktrees/probe'], capture_output=True)
        if ignored.returncode:
            raise ValueError('.worktrees/ must be ignored before creating an in-project worktree')
    branch = 'codex/' + slug
    git(root, 'worktree', 'add', '-b', branch, str(dest), revision)
    # Install the project version and configuration, including uncommitted setup.
    # Application changes are intentionally not copied.
    try:
        src = safe_path(root, '.factory')
        dst = safe_path(dest, '.factory')
        for file in src.rglob('*'):
            relative = file.relative_to(src)
            if any(p in {'tasks', '__pycache__'} for p in relative.parts) or not file.is_file():
                continue
            safe_path(root, file.relative_to(root))
            out = safe_path(dest, Path('.factory') / relative)
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(file, out)
        install(dest)
        existing = task_path(root, slug, must_exist=False)
        destination_task = task_path(dest, slug, must_exist=False)
        if existing.is_dir():
            # Task notes only; evidence belongs to the checkout where it was gathered.
            destination_task.mkdir(parents=True, exist_ok=True)
            for name in ('task.md', 'review.md'):
                source_note = safe_path(root, existing.relative_to(root) / name)
                if source_note.is_file():
                    shutil.copyfile(source_note, safe_path(dest, destination_task.relative_to(dest) / name))
        elif not destination_task.exists():
            create_task(dest, slug)
    except (OSError, ValueError) as exc:
        raise ValueError('Worktree exists at {}; setup incomplete: {}. Inspect it before retrying; no work was deleted.'.format(dest, exc)) from exc
    print('Worktree: {}\nBranch: {}\nBase commit: {}'.format(dest, branch, revision))


def snapshot(root):
    # Exclude mutable task records/evidence from the snapshot to avoid self-invalidation.
    paths = ['.', ':(exclude).factory/tasks']
    diff = git(root, 'diff', 'HEAD', '--', *paths, required=False)
    status = git(root, 'status', '--porcelain', '--untracked-files=all', '--', *paths)
    digest = hashlib.sha256((diff or '').encode('utf-8'))
    raw = subprocess.run(['git', '-C', str(root), 'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', *paths], capture_output=True, check=True).stdout
    for name in sorted(raw.split(b'\0')):
        if not name:
            continue
        file = root / os.fsdecode(name)
        digest.update(name)
        if file.is_symlink():
            digest.update(os.readlink(file).encode('utf-8'))
        elif file.is_file():
            with file.open('rb') as stream:
                for chunk in iter(lambda: stream.read(1024 * 1024), b''):
                    digest.update(chunk)
    return {'head': git(root, 'rev-parse', '--verify', 'HEAD', required=False),
            'branch': git(root, 'branch', '--show-current'), 'status': status,
            'content_digest': digest.hexdigest(),
            'config_digest': hashlib.sha256(safe_path(root, '.factory/config.json').read_bytes()).hexdigest()}


def run_check(root, check, log):
    started = datetime.now(timezone.utc)
    status, code = 'error', None
    with log.open('w', encoding='utf-8') as output:
        try:
            process = subprocess.Popen(check['argv'], cwd=root, stdout=output, stderr=subprocess.STDOUT,
                                       start_new_session=(os.name == 'posix'))
            try:
                code = process.wait(timeout=check.get('timeout_seconds', 300))
                status = 'passed' if code == 0 else 'failed'
            except subprocess.TimeoutExpired:
                if os.name == 'posix':
                    try:
                        os.killpg(process.pid, signal.SIGKILL)
                    except ProcessLookupError:
                        pass
                else:
                    process.kill()
                process.wait()
                output.write('\nCheck timed out.\n')
                status = 'timeout'
        except OSError as exc:
            output.write(str(exc) + '\n')
    return {'name': check['name'], 'argv': check['argv'], 'status': status, 'exit_code': code,
            'seconds': (datetime.now(timezone.utc) - started).total_seconds(), 'log': log.name}


def verify(root, slug):
    data = config(root, need_checks=True)
    task = task_path(root, slug)
    before = snapshot(root)
    run_id = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '-' + uuid.uuid4().hex[:8]
    directory = safe_path(root, task.relative_to(root) / 'evidence' / run_id)
    directory.mkdir(parents=True)
    results = []
    for index, check in enumerate(data['checks'], 1):
        print('Running ' + check['name'], flush=True)
        results.append(run_check(root, check, directory / '{:02d}.log'.format(index)))
    after = snapshot(root)
    passed = all(r['status'] == 'passed' for r in results) and before == after
    report = {'run_id': run_id, 'factory_version': VERSION, 'passed': passed,
              'project': str(root), 'before': before, 'after': after,
              'workspace_changed_during_checks': before != after, 'checks': results}
    write_json(directory / 'results.json', report)
    print('{}: {}'.format('PASS' if passed else 'FAIL', directory / 'results.json'))
    return 0 if passed else 1


def packet(root, slug):
    task = task_path(root, slug)
    evidence = safe_path(root, task.relative_to(root) / 'evidence')
    reports = sorted(evidence.glob('*/results.json'))
    if not reports:
        raise ValueError('No evidence; run verify first')
    report_path = reports[-1]
    report = json.loads(report_path.read_text(encoding='utf-8'))
    current = snapshot(root)
    stale = current != report['after']
    lines = ['# Delivery packet: ' + slug, '', 'Generated summary; not a merge approval.', '',
             'Run: `' + report['run_id'] + '`', 'Tested HEAD: `' + str(report['before']['head']) + '`',
             'Checks passed: ' + str(report['passed']), 'Evidence stale against current checkout: ' + str(stale),
             '', '## Checks', '']
    for result in report['checks']:
        link = report_path.parent.relative_to(task) / result['log']
        lines.append('- {}: **{}** ([log]({}))'.format(result['name'], result['status'], link.as_posix()))
    lines += ['', '## Task and evidence', '', '- [Requirements, progress and handoff](task.md)',
              '- [Review record](review.md)', '- [Run manifest](' + report_path.relative_to(task).as_posix() + ')', '',
              'Before/after runtime evidence and acceptance-criterion mapping belong in task.md.',
              'Review the logs for sensitive data before sharing. Artifacts remain local.', '',
              '## Review and delivery', '',
              'Confirm current-revision review, resolve actionable findings, and record any accepted limitations.',
              'Follow the project delivery policy. This utility does not push, publish, or merge.', '']
    safe_path(root, task.relative_to(root) / 'delivery.md').write_text('\n'.join(lines), encoding='utf-8')
    print(task / 'delivery.md')
    return 1 if stale or not report['passed'] else 0


def doctor(root):
    data = config(root)
    checks = len(data['checks'])
    print('Factory {} | Python {} | {}'.format(VERSION, sys.version.split()[0], root))
    print('Checks configured: {}{}'.format(checks, '' if checks else ' (required before verification)'))
    base_exists = bool(git(root, 'rev-parse', '--verify', data['base_ref'] + '^{commit}', required=False))
    print('Base {}: {}'.format(data['base_ref'], 'available' if base_exists else 'missing; commit baseline or change base_ref'))
    print('Review preference: ' + str(data.get('review', {}).get('provider', 'manual')))
    print('Greptile account/installation status is not checked by this local command.')
    return 0 if checks and base_exists else 1


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version', action='version', version=VERSION)
    parser.add_argument('--project', default='.', help='Git project root (default: current directory)')
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('init', help='Install kit; preserve all existing files')
    sub.add_parser('doctor', help='Check local configuration and base ref')
    task = sub.add_parser('task', help='Create task and review records')
    task.add_argument('slug')
    task.add_argument('--title')
    tree = sub.add_parser('worktree', help='Create isolated checkout and task record')
    tree.add_argument('slug')
    tree.add_argument('--destination', required=True)
    tree.add_argument('--base', help='Local ref; does not fetch automatically')
    for name in ('verify', 'packet'):
        command = sub.add_parser(name)
        command.add_argument('slug')
    args = parser.parse_args()
    try:
        root = project_root(args.project)
        if args.command == 'init':
            install(root)
            return 0
        if args.command == 'task':
            create_task(root, args.slug, args.title)
            return 0
        if args.command == 'worktree':
            worktree(root, args.slug, args.destination, args.base)
            return 0
        if args.command == 'doctor':
            return doctor(root)
        return verify(root, args.slug) if args.command == 'verify' else packet(root, args.slug)
    except (ValueError, OSError, subprocess.SubprocessError) as exc:
        print('Factory error: ' + str(exc), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
